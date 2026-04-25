"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Copy, X } from "lucide-react"

const ASPECTS = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"]

interface Img {
  id: string
  prompt: string
  aspect_ratio: string
  size_preset: string
  public_url: string
  status: string
  error_message: string | null
  tags: string[]
  created_at: string
}

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

export function ImageGrid({ images, templates }: { images: Img[]; templates: Tpl[] }) {
  const router = useRouter()
  const [genOpen, setGenOpen] = useState(false)
  const [previewImg, setPreviewImg] = useState<Img | null>(null)
  const [pending, startTransition] = useTransition()

  const remove = (id: string) => {
    if (!confirm("この画像を削除しますか?")) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/images/${id}`, { method: "DELETE" })
      if (res.ok) {
        if (previewImg?.id === id) setPreviewImg(null)
        router.refresh()
      }
    })
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setGenOpen(true)}><Plus className="h-4 w-4 mr-1" />新規生成</Button>
      </div>

      {images.length === 0 ? (
        <p className="text-center text-gray-400 py-12">まだ画像がありません</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setPreviewImg(img)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 ring-emerald-500"
            >
              {img.status === "succeeded" ? (
                <Image src={img.public_url} alt={img.prompt} fill className="object-cover" sizes="200px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-950 text-xs text-red-600 p-2 text-center">
                  {img.error_message || "失敗"}
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-[10px] text-left opacity-0 group-hover:opacity-100">
                {img.aspect_ratio} / {img.size_preset}
              </div>
            </button>
          ))}
        </div>
      )}

      {genOpen && (
        <GenerateModal
          templates={templates}
          onClose={() => setGenOpen(false)}
          onGenerated={() => { setGenOpen(false); router.refresh() }}
        />
      )}

      {previewImg && (
        <PreviewModal
          image={previewImg}
          onClose={() => setPreviewImg(null)}
          onDelete={() => remove(previewImg.id)}
          pending={pending}
        />
      )}
    </div>
  )
}

function GenerateModal({
  templates,
  onClose,
  onGenerated,
}: {
  templates: Tpl[]
  onClose: () => void
  onGenerated: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [tplId, setTplId] = useState("")
  const [vars, setVars] = useState<Record<string, string>>({})
  const [prompt, setPrompt] = useState("")
  const [aspect, setAspect] = useState("1:1")
  const [size, setSize] = useState<"standard" | "hd">("standard")
  const [tags, setTags] = useState("")
  const [error, setError] = useState<string | null>(null)

  const tpl = templates.find((t) => t.id === tplId)

  const applyTemplate = (id: string) => {
    setTplId(id)
    const t = templates.find((x) => x.id === id)
    if (!t) { setPrompt(""); return }
    const initVars: Record<string, string> = {}
    for (const v of t.variables ?? []) initVars[v.name] = v.default ?? ""
    setVars(initVars)
    setAspect(t.default_aspect_ratio)
    setSize(t.default_size_preset === "hd" ? "hd" : "standard")
    setPrompt(expandTemplate(t.prompt_template, initVars))
  }

  const onVarChange = (name: string, value: string) => {
    const next = { ...vars, [name]: value }
    setVars(next)
    if (tpl) setPrompt(expandTemplate(tpl.prompt_template, next))
  }

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/images/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspect,
          size_preset: size,
          prompt_template_id: tplId || null,
          tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "生成失敗")
        return
      }
      onGenerated()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">新規画像生成</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div>
          <Label>テンプレート</Label>
          <select value={tplId} onChange={(e) => applyTemplate(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
            <option value="">(テンプレートなし)</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.is_favorite ? "★ " : ""}{t.name} {t.category ? `(${t.category})` : ""}</option>
            ))}
          </select>
        </div>

        {tpl && tpl.variables && tpl.variables.length > 0 && (
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">変数</p>
            {tpl.variables.map((v) => (
              <div key={v.name}>
                <Label className="text-xs">{v.label} ({v.name})</Label>
                <Input value={vars[v.name] ?? ""} onChange={(e) => onVarChange(v.name, e.target.value)} />
              </div>
            ))}
          </div>
        )}

        <div>
          <Label>プロンプト</Label>
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>アスペクト比</Label>
            <select value={aspect} onChange={(e) => setAspect(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
              {ASPECTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <Label>サイズ</Label>
            <select value={size} onChange={(e) => setSize(e.target.value as "standard" | "hd")} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
              <option value="standard">Standard (1024)</option>
              <option value="hd">HD (2048)</option>
            </select>
          </div>
        </div>

        <div>
          <Label>タグ (カンマ区切り)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="hero, sunrise" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button disabled={pending || !prompt} onClick={submit}>
            {pending ? "生成中..." : "生成する"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function PreviewModal({
  image,
  onClose,
  onDelete,
  pending,
}: {
  image: Img
  onClose: () => void
  onDelete: () => void
  pending: boolean
}) {
  const copyUrl = () => {
    navigator.clipboard.writeText(image.public_url)
    alert("URL をコピーしました")
  }
  const copyRef = () => {
    navigator.clipboard.writeText(`supabase-image:${image.id}`)
    alert("参照キーをコピーしました")
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
          {image.status === "succeeded"
            ? <Image src={image.public_url} alt={image.prompt} fill className="object-contain" />
            : <div className="flex items-center justify-center h-full text-red-600">{image.error_message || "失敗"}</div>}
          <button onClick={onClose} className="absolute top-2 right-2 bg-black/50 text-white rounded p-1"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">プロンプト</p>
            <p className="text-gray-900 dark:text-gray-100">{image.prompt}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{image.aspect_ratio}</Badge>
            <Badge variant="secondary">{image.size_preset}</Badge>
            {image.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
          </div>
          <div>
            <p className="text-xs text-gray-500 break-all">URL: {image.public_url}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button size="sm" variant="outline" onClick={copyUrl}><Copy className="h-3 w-3 mr-1" />URL コピー</Button>
            <Button size="sm" variant="outline" onClick={copyRef}><Copy className="h-3 w-3 mr-1" />参照キーコピー</Button>
            <Button size="sm" variant="destructive" disabled={pending} onClick={onDelete}><Trash2 className="h-3 w-3 mr-1" />削除</Button>
          </div>
          <p className="text-xs text-gray-400 pt-2">
            「参照キー」を LP セクションの画像フィールドに貼ると、画像 ↔ セクションが自動で紐付きます。
          </p>
        </div>
      </div>
    </div>
  )
}

function expandTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
}
