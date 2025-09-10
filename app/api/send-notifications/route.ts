import { createClient } from "@/lib/supabase/server"
import { sendReminderEmail } from "@/lib/email"
import { NextResponse } from "next/server"
import { addMinutes } from "date-fns"

export async function POST(request: Request) {
  try {
    // Verify this is a legitimate cron request (you might want to add authentication)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const now = new Date()

    // Find study blocks that start in 10 minutes (with a 1-minute window for flexibility)
    const tenMinutesFromNow = addMinutes(now, 10)
    const nineMinutesFromNow = addMinutes(now, 9)

    console.log(
      "[v0] Checking for notifications between:",
      nineMinutesFromNow.toISOString(),
      "and",
      tenMinutesFromNow.toISOString(),
    )

    // Get study blocks that need notifications
    const { data: studyBlocks, error: blocksError } = await supabase
      .from("study_blocks")
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `)
      .gte("start_time", nineMinutesFromNow.toISOString())
      .lte("start_time", tenMinutesFromNow.toISOString())
      .eq("notification_sent", false)

    if (blocksError) {
      console.error("[v0] Error fetching study blocks:", blocksError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    console.log("[v0] Found", studyBlocks?.length || 0, "blocks needing notifications")

    if (!studyBlocks || studyBlocks.length === 0) {
      return NextResponse.json({
        message: "No notifications to send",
        processed: 0,
        timestamp: now.toISOString(),
      })
    }

    const results = []

    for (const block of studyBlocks) {
      try {
        console.log("[v0] Processing notification for block:", block.id, "user:", block.profiles.email)

        // Send reminder email
        await sendReminderEmail({
          user: block.profiles,
          studyBlock: block,
        })

        // Mark notification as sent
        const { error: updateError } = await supabase
          .from("study_blocks")
          .update({ notification_sent: true })
          .eq("id", block.id)

        if (updateError) {
          console.error("[v0] Error updating notification status:", updateError)
          results.push({
            blockId: block.id,
            success: false,
            error: updateError.message,
          })
          continue
        }

        // Log the notification
        const { error: logError } = await supabase.from("email_notifications").insert({
          study_block_id: block.id,
          user_id: block.user_id,
          email_type: "reminder",
        })

        if (logError) {
          console.error("[v0] Error logging notification:", logError)
        }

        results.push({
          blockId: block.id,
          success: true,
          email: block.profiles.email,
          title: block.title,
        })

        console.log("[v0] Successfully sent notification for block:", block.id)
      } catch (emailError) {
        console.error("[v0] Error sending email for block", block.id, ":", emailError)
        results.push({
          blockId: block.id,
          success: false,
          error: emailError instanceof Error ? emailError.message : "Unknown error",
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    console.log("[v0] Notification batch complete. Success:", successCount, "Failures:", failureCount)

    return NextResponse.json({
      message: `Processed ${results.length} notifications`,
      success: successCount,
      failures: failureCount,
      results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("[v0] Notification cron error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: "Notification endpoint is active",
    timestamp: new Date().toISOString(),
  })
}
