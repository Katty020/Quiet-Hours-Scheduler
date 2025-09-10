import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin/admin-header"
import { TestEmailForm } from "@/components/admin/test-email-form"
import { format } from "date-fns"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get notification statistics
  const { data: totalNotifications } = await supabase.from("email_notifications").select("id", { count: "exact" })

  const { data: todayNotifications } = await supabase
    .from("email_notifications")
    .select("id", { count: "exact" })
    .gte("sent_at", new Date().toISOString().split("T")[0])

  const { data: upcomingBlocks } = await supabase
    .from("study_blocks")
    .select("id", { count: "exact" })
    .gte("start_time", new Date().toISOString())
    .eq("notification_sent", false)

  const { data: recentNotifications } = await supabase
    .from("email_notifications")
    .select(`
      *,
      study_blocks:study_block_id (
        title,
        start_time
      ),
      profiles:user_id (
        email,
        full_name
      )
    `)
    .order("sent_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor notifications and system health</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Notifications Sent</CardDescription>
              <CardTitle className="text-3xl">{totalNotifications?.length || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Notifications Today</CardDescription>
              <CardTitle className="text-3xl">{todayNotifications?.length || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Upcoming Blocks</CardDescription>
              <CardTitle className="text-3xl">{upcomingBlocks?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest email notifications sent to users</CardDescription>
            </CardHeader>
            <CardContent>
              {recentNotifications && recentNotifications.length > 0 ? (
                <div className="space-y-4">
                  {recentNotifications.map((notification: any) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.study_blocks?.title}</p>
                        <p className="text-xs text-gray-600">{notification.profiles?.email}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(notification.sent_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {notification.email_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No notifications sent yet</p>
              )}
            </CardContent>
          </Card>

          {/* Test Email Form */}
          <Card>
            <CardHeader>
              <CardTitle>Test Email System</CardTitle>
              <CardDescription>Send test emails to verify the notification system</CardDescription>
            </CardHeader>
            <CardContent>
              <TestEmailForm />
            </CardContent>
          </Card>
        </div>

        {/* CRON Job Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>CRON Job Information</CardTitle>
            <CardDescription>Notification system runs every minute to check for upcoming study blocks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Notification Schedule</p>
                  <p className="text-sm text-gray-600">Checks every minute for blocks starting in 10 minutes</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Endpoint:</strong> /api/send-notifications
                </p>
                <p>
                  <strong>Schedule:</strong> * * * * * (every minute)
                </p>
                <p>
                  <strong>Authentication:</strong> Bearer token required (CRON_SECRET)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
