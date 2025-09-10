import { createClient } from "@/lib/supabase/server"
import { sendReminderEmail, sendConfirmationEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { type = "reminder", blockId } = await request.json()

    if (!blockId) {
      return NextResponse.json({ error: "Block ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the study block with user info
    const { data: block, error } = await supabase
      .from("study_blocks")
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `)
      .eq("id", blockId)
      .single()

    if (error || !block) {
      return NextResponse.json({ error: "Study block not found" }, { status: 404 })
    }

    // Send the appropriate email
    let result
    if (type === "confirmation") {
      result = await sendConfirmationEmail({
        user: block.profiles,
        studyBlock: block,
      })
    } else {
      result = await sendReminderEmail({
        user: block.profiles,
        studyBlock: block,
      })
    }

    return NextResponse.json({
      message: `${type} email sent successfully`,
      result,
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      {
        error: "Failed to send test email",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
