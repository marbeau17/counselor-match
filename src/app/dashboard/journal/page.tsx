import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JournalForm } from "./JournalForm"
import { formatDate } from "@/lib/utils"
import { BookOpen } from "lucide-react"

type JournalEntry = {
  id: string
  body: string
  booking_id: string | null
  created_at: string
}

export default async function JournalPage() {
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id, body, booking_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const list = (entries ?? []) as JournalEntry[]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-emerald-600" />
          振り返りジャーナル
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          セッションでの気づき、日々の感情の動き、内省の言葉を自由に記録しましょう。
        </p>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">新しい記録を書く</CardTitle>
          </CardHeader>
          <CardContent>
            <JournalForm />
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">過去の記録</h2>
      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-400 dark:text-gray-500">まだ記録がありません。最初の一行を書いてみましょう。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{formatDate(e.created_at)}</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{e.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
