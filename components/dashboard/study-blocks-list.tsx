"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudyBlockForm } from "./study-block-form"
import { DeleteStudyBlockButton } from "./delete-study-block-button"
import type { StudyBlock } from "@/lib/types"
import { format, isAfter, addMinutes } from "date-fns"
import { Clock, Edit, Calendar } from "lucide-react"

interface StudyBlocksListProps {
  initialBlocks: StudyBlock[]
}

export function StudyBlocksList({ initialBlocks }: StudyBlocksListProps) {
  const [blocks, setBlocks] = useState<StudyBlock[]>(initialBlocks)
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null)

  const handleBlockCreated = (newBlock: StudyBlock) => {
    setBlocks((prev) =>
      [...prev, newBlock].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    )
  }

  const handleBlockUpdated = (updatedBlock: StudyBlock) => {
    setBlocks((prev) => prev.map((block) => (block.id === updatedBlock.id ? updatedBlock : block)))
    setEditingBlock(null)
  }

  const handleBlockDeleted = (deletedId: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== deletedId))
  }

  const getBlockStatus = (block: StudyBlock) => {
    const now = new Date()
    const startTime = new Date(block.start_time)
    const endTime = new Date(block.end_time)
    const notificationTime = addMinutes(startTime, -10)

    if (isAfter(now, endTime)) {
      return { status: "completed", color: "bg-green-100 text-green-800" }
    } else if (isAfter(now, startTime)) {
      return { status: "active", color: "bg-blue-100 text-blue-800" }
    } else if (isAfter(now, notificationTime)) {
      return { status: "starting-soon", color: "bg-yellow-100 text-yellow-800" }
    } else {
      return { status: "upcoming", color: "bg-gray-100 text-gray-800" }
    }
  }

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (blocks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No study blocks yet</h3>
          <p className="text-gray-500 text-center mb-4">
            Create your first quiet hour session to get started with focused studying.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        const { status, color } = getBlockStatus(block)

        return (
          <Card key={block.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{block.title}</CardTitle>
                  {block.description && <p className="text-sm text-gray-600 mt-1">{block.description}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={color}>
                    {status === "completed" && "Completed"}
                    {status === "active" && "Active Now"}
                    {status === "starting-soon" && "Starting Soon"}
                    {status === "upcoming" && "Upcoming"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(block.start_time), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(block.start_time), "h:mm a")} - {format(new Date(block.end_time), "h:mm a")}
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {formatDuration(block.start_time, block.end_time)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingBlock(block)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <DeleteStudyBlockButton blockId={block.id} onDeleted={() => handleBlockDeleted(block.id)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {editingBlock && (
        <StudyBlockForm block={editingBlock} onSuccess={handleBlockUpdated} onCancel={() => setEditingBlock(null)} />
      )}
    </div>
  )
}
