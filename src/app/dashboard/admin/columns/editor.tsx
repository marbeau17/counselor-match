"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface ColumnData {
  id: string
  slug: string
  title: string
  body: string
  excerpt: string
  category: string
  published_at: string | null
}

export function ColumnEditor({
  mode,
  column,
}: {
  mode: "create" | "edit"
  column?: ColumnData
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [slug, setSlug] = useState(column?.slug || "")
  const [title, setTitle] = useState(column?.title || "")
  const [body, setBody] = useState(column?.body || "")
  const [excerpt, setExcerpt] = useState(column?.excerpt || "")
  const [category, setCategory] = useState(column?.category || "")
  const [error, setError] = useState<string | null>(null)
  const isPublished = !!column?.published_at

  const save = (publishAction?: "publish" | "unpublish") => {
    setError(null)
    startTransition(async () => {
      const payload: Record<string, unknown> = { slug, title, body, excerpt, category: category || null }
      if (publishAction === "publish") payload.published_at = new Date().toISOString()
      if (publishAction === "unpublish") payload.published_at = null

      const res = mode === "create"
        ? await fetch(`/api/admin/columns`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/columns/${column!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "保存に失敗しました")
        return
      }
      const j = await res.json()
      if (mode === "create") {
        router.push(`/dashboard/admin/columns/${j.column.id}`)
      } else {
        router.refresh()
      }
    })
  }

  const remove = () => {
    if (!column) return
    if (!confirm("削除します。よろしいですか?")) return
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/columns/${column.id}`, { method: "DELETE" })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "削除失敗")
        return
      }
      router.push("/dashboard/admin/columns")
    })
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>タイトル</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="コラムタイトル" />
          </div>
          <div>
            <Label>スラッグ (URL)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-first-column" />
          </div>
        </div>

        <div>
          <Label>カテゴリ</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          >
            <option value="">未分類</option>
            <option value="founder">founder</option>
            <option value="seo">seo</option>
            <option value="counselor">counselor</option>
            <option value="testimonial">testimonial</option>
          </select>
        </div>

        <div>
          <Label>抜粋 (excerpt)</Label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="一覧表示・OG description に使用"
            rows={3}
          />
        </div>

        <div>
          <Label>本文 (Markdown)</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button disabled={pending} onClick={() => save()}>
            {mode === "create" ? "下書き保存" : "更新"}
          </Button>
          {mode === "edit" && !isPublished && (
            <Button variant="default" disabled={pending} onClick={() => save("publish")}>公開する</Button>
          )}
          {mode === "edit" && isPublished && (
            <Button variant="outline" disabled={pending} onClick={() => save("unpublish")}>非公開に戻す</Button>
          )}
          {mode === "edit" && (
            <Button variant="destructive" disabled={pending} onClick={remove}>削除</Button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  )
}
