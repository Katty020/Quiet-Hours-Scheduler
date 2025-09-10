import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiet Hours</h1>
          <p className="text-lg text-gray-600">Schedule your silent study time blocks</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome to Quiet Hours Scheduler</CardTitle>
            <CardDescription>
              Create focused study sessions with smart email reminders 10 minutes before each block starts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>✨ Smart notifications • 📚 Focus tracking • 🔒 Secure & private</p>
        </div>
      </div>
    </div>
  )
}
