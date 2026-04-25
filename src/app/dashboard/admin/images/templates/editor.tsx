"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Star } from "lucide-react"

const ASPECTS = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"]

interface Tpl {
  id: string
  name: string
  category: string | null
  prompt_template: string
  default_aspect_ratio: string
  default_size_preset: string
  variables: { name: string; label: string; default?: string }[]
  is_favorite: boolean
}

export function TemplatesEditor({ templates }: { templates: Tpl[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Tpl | "new" | null>(null)
  const [pending, startTransition] = useTransition()

  const remove = (id: string) => {
    if (!confirm("削除しますか?")) return
    startTransition(async () => {
      await fetch(`/api/admin/prompt-templates/${id}`, { method: "DELETE" })
      router.refresh()
    })
  }

  const toggleFav = (t: Tpl) => {
    startTransition(async () => {
      await fetch(`/api/admin/prompt-templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !t.is_favorite }),
      })
      router.refresh()
    })
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4 mr-1" />新規テンプレ</Button>
      </div>

      {templates.length === 0 ? (
        <p className="text-center text-gray-400 py-8">テンプレートがまだありません</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {templates.map((t) => (
            <li key={t.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleFav(t)} disabled={pending}>
                    <Star className={`h-4 w-4 ${t.is_favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                  </button>
                  <span className="font-medium">{t.name}</span>
                  {t.category && <Badge variant="secondary">{t.category}</Badge>}
                  <Badge variant="outline">{t.default_aspect_ratio}</Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500 truncate">{t.prompt_template}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setEditing(t)}>編集</Button>
                <Button size="sm" variant="destructive" disabled={pending} onClick={() => remove(t.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <TemplateForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh() }}
        />
      )}
    </div>
  )
}

function TemplateForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Tpl | null
  onClose: () => void
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState(initial?.name ?? "")
  const [category, setCategory] = useState(initial?.category ?? "")
  const [prompt, setPrompt] = useState(initial?.prompt_template ?? "")
  const [aspect, setAspect] = useState(initial?.default_aspect_ratio ?? "1:1")
  const [size, setSize] = useState<"standard" | "hd">(initial?.default_size_preset === "hd" ? "hd" : "standard")
  const [variables, setVariables] = useState<{ name: string; label: string; default: string }[]>(
    (initial?.variables ?? []).map((v) => ({ name: v.name, label: v.label, default: v.default ?? "" }))
  )
  const [isFav, setIsFav] = useState(initial?.is_favorite ?? false)
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const url = initial ? `/api/admin/prompt-templates/${initial.id}` : `/api/admin/prompt-templates`
      const method = initial ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, category: category || null, prompt_template: prompt,
          default_aspect_ratio: aspect, default_size_preset: size,
          variables, is_favorite: isFav,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "保存失敗")
        return
      }
      onSaved()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold">{initial ? "テンプレ編集" : "新規テンプレ"}</h2>

        <div>
          <Label>名前</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>カテゴリ</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="hero / banner / illustration..." />
        </div>
        <div>
          <Label>プロンプトテンプレート ({"{変数名}"} で展開)</Label>
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="font-mono text-xs" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>デフォルト アスペクト</Label>
            <select value={aspect} onChange={(e) => setAspect(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
              {ASPECTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <Label>デフォルト サイズ</Label>
            <select value={size} onChange={(e) => setSize(e.target.value as "standard" | "hd")} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
              <option value="standard">Standard</option>
              <option value="hd">HD</option>
            </select>
          </div>
        </div>

        <div>
          <Label>変数</Label>
          <div className="space-y-2">
            {variables.map((v, i) => (
              <div key={i} className="flex gap-2">
                <Input value={v.name} placeholder="変数名" onChange={(e) => setVariables(variables.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                <Input value={v.label} placeholder="ラベル" onChange={(e) => setVariables(variables.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                <Input value={v.default} placeholder="デフォルト値" onChange={(e) => setVariables(variables.map((x, j) => j === i ? { ...x, default: e.target.value } : x))} />
                <Button size="sm" variant="destructive" onClick={() => setVariables(variables.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setVariables([...variables, { name: "", label: "", default: "" }])}><Plus className="h-3 w-3 mr-1" />変数追加</Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="fav" checked={isFav} onChange={(e) => setIsFav(e.target.checked)} />
          <label htmlFor="fav" className="text-sm">お気に入り</label>
        </div>

        {error && <p className="text-red-600 text-xs">{error}</p>}

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button disabled={pending || !name || !prompt} onClick={submit}>保存</Button>
        </div>
      </div>
    </div>
  )
}
