"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface NotificationLog {
  id: string
  sent_at: string
  email_type: string
  study_blocks: {
    title: string
    start_time: string
  }
  profiles: {
    email: string
    full_name?: string
  }
}

interface NotificationLogsProps {
  logs: NotificationLog[]
}

export function NotificationLogs({ logs }: NotificationLogsProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">No notification logs found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{log.study_blocks.title}</CardTitle>
                <p className="text-sm text-gray-600">{log.profiles.email}</p>
              </div>
              <Badge variant="secondary">{log.email_type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Sent: {format(new Date(log.sent_at), "MMM d, yyyy 'at' h:mm a")}</p>
              <p>Session: {format(new Date(log.study_blocks.start_time), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
