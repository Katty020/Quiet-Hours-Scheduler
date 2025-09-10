"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StudyBlockForm } from "./study-block-form"
import { Plus } from "lucide-react"
import type { StudyBlock } from "@/lib/types"

export function CreateStudyBlockButton() {
  const [showForm, setShowForm] = useState(false)

  const handleSuccess = (block: StudyBlock) => {
    setShowForm(false)
    // Refresh the page to show the new block
    window.location.reload()
  }

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Study Block
      </Button>

      {showForm && <StudyBlockForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />}
    </>
  )
}
