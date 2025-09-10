"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TestEmailForm() {
  const [blockId, setBlockId] = useState("")
  const [emailType, setEmailType] = useState("reminder")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockId,
          type: emailType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.error || "Failed to send test email" })
      }
    } catch (error) {
      setResult({ success: false, message: "Network error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="blockId">Study Block ID</Label>
        <Input
          id="blockId"
          value={blockId}
          onChange={(e) => setBlockId(e.target.value)}
          placeholder="Enter study block ID"
          required
        />
        <p className="text-xs text-gray-500">You can find block IDs in the database or browser dev tools</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailType">Email Type</Label>
        <Select value={emailType} onValueChange={setEmailType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reminder">Reminder Email</SelectItem>
            <SelectItem value="confirmation">Confirmation Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending..." : "Send Test Email"}
      </Button>
    </form>
  )
}
