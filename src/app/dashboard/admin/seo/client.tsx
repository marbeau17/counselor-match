"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SeoData {
  id?: string
  page_path: string
  title: string
  description: string
  og_image_url: string
  noindex: boolean
}

export function SeoForm({ initial }: { initial?: SeoData }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [data, setData] = useState<SeoData>(
    initial ?? { page_path: "", title: "", description: "", og_image_url: "", noindex: false }
  )
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const submit = () => {
    setError(null); setMessage(null)
    startTransition(async () => {
      // upsert API
      const res = await fetch(`/api/admin/seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "失敗")
        return
      }
      setMessage("保存しました")
      if (!initial) setData({ page_path: "", title: "", description: "", og_image_url: "", noindex: false })
      router.refresh()
    })
  }

  return (
    <div className="space-y-3 text-sm">
      <div>
        <Label>ページパス (例: /, /counselors, /columns/[slug])</Label>
        <Input
          value={data.page_path}
          onChange={(e) => setData({ ...data, page_path: e.target.value })}
          placeholder="/counselors"
          disabled={!!initial}
        />
      </div>
      <div>
        <Label>title</Label>
        <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
      </div>
      <div>
        <Label>description</Label>
        <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={2} />
      </div>
      <div>
        <Label>OGP image URL</Label>
        <Input value={data.og_image_url} onChange={(e) => setData({ ...data, og_image_url: e.target.value })} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="noindex"
          checked={data.noindex}
          onChange={(e) => setData({ ...data, noindex: e.target.checked })}
        />
        <label htmlFor="noindex" className="text-sm">noindex (検索結果から除外)</label>
      </div>
      <div>
        <Button disabled={pending || !data.page_path} onClick={submit}>保存</Button>
      </div>
      {error && <p className="text-red-600 text-xs">{error}</p>}
      {message && <p className="text-emerald-600 text-xs">{message}</p>}
    </div>
  )
}

export function SeoRowActions({ seo }: { seo: SeoData }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const remove = () => {
    if (!seo.id) return
    if (!confirm(`${seo.page_path} の SEO 設定を削除しますか?`)) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/seo/${seo.id}`, { method: "DELETE" })
      if (res.ok) router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
          {open ? "閉じる" : "編集"}
        </Button>
        <Button size="sm" variant="destructive" disabled={pending} onClick={remove}>削除</Button>
      </div>
      {open && (
        <div className="w-[420px] max-w-[80vw] mt-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900">
          <SeoForm initial={seo} />
        </div>
      )}
    </div>
  )
}
