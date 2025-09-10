import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StudyBlocksList } from "@/components/dashboard/study-blocks-list"
import { CreateStudyBlockButton } from "@/components/dashboard/create-study-block-button"
import type { StudyBlock } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's study blocks
  const { data: studyBlocks, error } = await supabase
    .from("study_blocks")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching study blocks:", error)
  }

  const blocks = (studyBlocks as StudyBlock[]) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Quiet Hours</h1>
              <p className="text-gray-600 mt-1">Manage your focused study sessions</p>
            </div>
            <CreateStudyBlockButton />
          </div>
        </div>

        <StudyBlocksList initialBlocks={blocks} />
      </main>
    </div>
  )
}
