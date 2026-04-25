"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function JournalForm() {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (body.trim().length === 0) {
      setError("内容を入力してください")
      return
    }
    setBusy(true)
    const supabase = createClient()
    if (!supabase) {
      setError("接続できません")
      setBusy(false)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("ログインが必要です")
      setBusy(false)
      return
    }
    const { error: err } = await supabase
      .from("journal_entries")
      .insert({ user_id: user.id, body: body.trim() })
    if (err) {
      setError(err.message || "保存に失敗しました")
      setBusy(false)
      return
    }
    setBody("")
    setBusy(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="今日感じたこと、気づいたこと、問いかけ..."
        rows={4}
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? "保存中..." : "記録する"}
        </Button>
      </div>
    </form>
  )
}
