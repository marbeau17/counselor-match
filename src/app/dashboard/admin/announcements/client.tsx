"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function AnnouncementForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [level, setLevel] = useState("info")
  const [endsAt, setEndsAt] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          level,
          ends_at: endsAt || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "失敗")
        return
      }
      setTitle(""); setBody(""); setLevel("info"); setEndsAt("")
      router.refresh()
    })
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <Label>タイトル</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>レベル</Label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          >
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="critical">critical</option>
          </select>
        </div>
      </div>
      <div>
        <Label>本文</Label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
      </div>
      <div>
        <Label>終了日時 (任意)</Label>
        <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
      </div>
      <div>
        <Button disabled={pending || !title || !body} onClick={submit}>下書き保存</Button>
      </div>
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  )
}

export function AnnouncementRowActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const togglePublish = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !isPublished }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "失敗")
        return
      }
      router.refresh()
    })
  }

  const remove = () => {
    if (!confirm("削除しますか?")) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "削除失敗")
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <Button size="sm" variant={isPublished ? "outline" : "default"} disabled={pending} onClick={togglePublish}>
          {isPublished ? "非公開" : "公開"}
        </Button>
        <Button size="sm" variant="destructive" disabled={pending} onClick={remove}>削除</Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
