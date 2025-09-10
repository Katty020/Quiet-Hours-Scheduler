"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import type { StudyBlock } from "@/lib/types"
import { format } from "date-fns"

interface StudyBlockFormProps {
  block?: StudyBlock
  onSuccess: (block: StudyBlock) => void
  onCancel: () => void
}

export function StudyBlockForm({ block, onSuccess, onCancel }: StudyBlockFormProps) {
  const [title, setTitle] = useState(block?.title || "")
  const [description, setDescription] = useState(block?.description || "")
  const [startDate, setStartDate] = useState(block ? format(new Date(block.start_time), "yyyy-MM-dd") : "")
  const [startTime, setStartTime] = useState(block ? format(new Date(block.start_time), "HH:mm") : "")
  const [endTime, setEndTime] = useState(block ? format(new Date(block.end_time), "HH:mm") : "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate inputs
      if (!title.trim() || !startDate || !startTime || !endTime) {
        setError("Please fill in all required fields")
        return
      }

      // Create datetime strings
      const startDateTime = new Date(`${startDate}T${startTime}:00`)
      const endDateTime = new Date(`${startDate}T${endTime}:00`)

      // Validate times
      if (endDateTime <= startDateTime) {
        setError("End time must be after start time")
        return
      }

      // Check for overlapping blocks
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        setError("User not authenticated")
        return
      }

      const { data: overlappingBlocks } = await supabase
        .from("study_blocks")
        .select("id")
        .eq("user_id", user.user.id)
        .neq("id", block?.id || "")
        .or(
          `and(start_time.lte.${startDateTime.toISOString()},end_time.gt.${startDateTime.toISOString()}),and(start_time.lt.${endDateTime.toISOString()},end_time.gte.${endDateTime.toISOString()}),and(start_time.gte.${startDateTime.toISOString()},end_time.lte.${endDateTime.toISOString()})`,
        )

      if (overlappingBlocks && overlappingBlocks.length > 0) {
        setError("This time slot overlaps with an existing study block")
        return
      }

      const blockData = {
        title: title.trim(),
        description: description.trim() || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        user_id: user.user.id,
      }

      let result
      if (block) {
        // Update existing block
        result = await supabase.from("study_blocks").update(blockData).eq("id", block.id).select().single()
      } else {
        // Create new block
        result = await supabase.from("study_blocks").insert(blockData).select().single()
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        onSuccess(result.data as StudyBlock)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{block ? "Edit Study Block" : "Create New Study Block"}</CardTitle>
          <CardDescription>Schedule a focused study session with automatic email reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Math Study Session"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes about this study session"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : block ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
