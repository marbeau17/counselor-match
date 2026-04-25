"use client"

import { useState, useTransition, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, X, History, ExternalLink } from "lucide-react"
import { SECTION_LABELS, SECTION_TYPES } from "@/components/landing/section-types"

interface Section {
  id: string
  page_key: string
  section_type: string
  sort_order: number
  is_visible: boolean
  draft_props: Record<string, unknown>
  published_props: Record<string, unknown> | null
  has_unpublished_changes: boolean
  variant_key: string | null
  variant_weight: number
}

interface History {
  id: string
  note: string | null
  published_at: string
  published_by: { display_name?: string; email?: string } | { display_name?: string; email?: string }[] | null
}

export function LandingEditor({
  initialSections,
  history,
}: {
  initialSections: Section[]
  history: History[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [sections, setSections] = useState(initialSections)
  const [selectedId, setSelectedId] = useState<string | null>(initialSections[0]?.id ?? null)
  const [previewToken, setPreviewToken] = useState<string | null>(null)
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const selected = sections.find((s) => s.id === selectedId) ?? null

  // プレビュートークン取得
  useEffect(() => {
    fetch(`/api/admin/landing/preview-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_key: "home" }),
    }).then((r) => r.json()).then((j) => setPreviewToken(j.token))
  }, [])

  // draft 編集 → debounce 500ms → API PATCH → iframe reload
  const draftDebounce = useRef<NodeJS.Timeout | null>(null)
  const updateDraft = (id: string, draft_props: Record<string, unknown>) => {
    setSections(sections.map((s) => s.id === id ? { ...s, draft_props } : s))
    if (draftDebounce.current) clearTimeout(draftDebounce.current)
    draftDebounce.current = setTimeout(async () => {
      await fetch(`/api/admin/landing/sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_props }),
      })
      // iframe reload
      iframeRef.current?.contentWindow?.location.reload()
      router.refresh()
    }, 500)
  }

  const updateMeta = (id: string, patch: Partial<Section>) => {
    setSections(sections.map((s) => s.id === id ? { ...s, ...patch } : s))
    startTransition(async () => {
      await fetch(`/api/admin/landing/sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      router.refresh()
    })
  }

  const move = (id: string, dir: -1 | 1) => {
    const idx = sections.findIndex((s) => s.id === id)
    const swap = idx + dir
    if (swap < 0 || swap >= sections.length) return
    const a = sections[idx], b = sections[swap]
    const newSec = [...sections]
    newSec[idx] = { ...b, sort_order: a.sort_order }
    newSec[swap] = { ...a, sort_order: b.sort_order }
    setSections(newSec)
    startTransition(async () => {
      await fetch(`/api/admin/landing/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: [
          { id: a.id, sort_order: b.sort_order },
          { id: b.id, sort_order: a.sort_order },
        ]}),
      })
      iframeRef.current?.contentWindow?.location.reload()
      router.refresh()
    })
  }

  const remove = (id: string) => {
    if (!confirm("このセクションを削除しますか?")) return
    startTransition(async () => {
      await fetch(`/api/admin/landing/sections/${id}`, { method: "DELETE" })
      setSections(sections.filter((s) => s.id !== id))
      if (selectedId === id) setSelectedId(null)
      iframeRef.current?.contentWindow?.location.reload()
      router.refresh()
    })
  }

  const addSection = (type: string) => {
    setAddOpen(false)
    startTransition(async () => {
      const res = await fetch(`/api/admin/landing/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_type: type, page_key: "home", draft_props: defaultPropsFor(type) }),
      })
      if (res.ok) {
        const j = await res.json()
        setSections([...sections, { ...j.section, draft_props: defaultPropsFor(type), published_props: null, has_unpublished_changes: true, is_visible: true, variant_key: null, variant_weight: 1, page_key: "home" }])
        setSelectedId(j.section.id)
        router.refresh()
      }
    })
  }

  const publish = () => {
    if (!confirm("現在の下書きを公開します。よろしいですか?")) return
    setError(null); setMessage(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/landing/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: "home" }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "公開失敗")
        return
      }
      setMessage("公開しました")
      router.refresh()
    })
  }

  const rollback = (historyId: string) => {
    if (!confirm("この時点の状態に戻します。現在の下書き / 公開はすべて上書きされます。よろしいですか?")) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/landing/publish-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history_id: historyId }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "失敗")
        return
      }
      setMessage("ロールバックしました")
      setHistoryOpen(false)
      router.refresh()
      window.location.reload()
    })
  }

  const previewUrl = useMemo(() => {
    if (!previewToken) return ""
    return `/?_preview=${encodeURIComponent(previewToken)}`
  }, [previewToken])

  const deviceWidth = device === "desktop" ? "100%" : device === "tablet" ? "768px" : "375px"

  return (
    <>
      {/* ツールバー */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" />セクション追加</Button>
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline"><ExternalLink className="h-4 w-4 mr-1" />新タブで全画面プレビュー</Button>
            </a>
          )}
          <Button size="sm" variant="outline" onClick={() => setHistoryOpen(true)}><History className="h-4 w-4 mr-1" />公開履歴</Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={pending} onClick={publish}>公開する</Button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {message && <p className="text-emerald-600 text-sm">{message}</p>}

      <div className="grid grid-cols-12 gap-4 mt-4" style={{ minHeight: "70vh" }}>
        {/* 左: セクションリスト */}
        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardContent className="p-2 space-y-1">
              {sections.map((s, i) => (
                <div
                  key={s.id}
                  className={`p-2 rounded cursor-pointer text-sm border ${selectedId === s.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{SECTION_LABELS[s.section_type] ?? s.section_type}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {!s.is_visible && <Badge variant="secondary" className="text-[10px]">非表示</Badge>}
                        {s.has_unpublished_changes && <Badge variant="default" className="text-[10px] bg-yellow-500">未公開</Badge>}
                        {s.variant_key && <Badge variant="outline" className="text-[10px]">A/B: {s.variant_key}</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); move(s.id, -1) }} disabled={i === 0}><ChevronUp className="h-3 w-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); move(s.id, 1) }} disabled={i === sections.length - 1}><ChevronDown className="h-3 w-3" /></button>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button onClick={(e) => { e.stopPropagation(); updateMeta(s.id, { is_visible: !s.is_visible }) }} title={s.is_visible ? "非表示にする" : "表示する"}>
                      {s.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-gray-400" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); remove(s.id) }} className="text-red-500" title="削除">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 中央: props 編集 */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="h-full">
            <CardContent className="p-4">
              {selected ? (
                <SectionForm
                  key={selected.id}
                  section={selected}
                  onUpdateDraft={(p) => updateDraft(selected.id, p)}
                  onUpdateMeta={(p) => updateMeta(selected.id, p)}
                />
              ) : (
                <p className="text-gray-400 text-center py-12">セクションを選択してください</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右: プレビュー */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full">
            <CardContent className="p-2">
              <div className="flex gap-1 mb-2 justify-center">
                {(["desktop", "tablet", "mobile"] as const).map((d) => (
                  <Button key={d} size="sm" variant={device === d ? "default" : "outline"} onClick={() => setDevice(d)}>{d}</Button>
                ))}
              </div>
              {previewUrl ? (
                <div className="overflow-auto bg-gray-100 dark:bg-gray-900 rounded" style={{ height: "65vh" }}>
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    style={{ width: deviceWidth, height: "100%", border: "none", margin: "0 auto", display: "block", background: "white" }}
                    title="LP preview"
                  />
                </div>
              ) : (
                <p className="text-center text-gray-400 py-12">プレビュー準備中...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setAddOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">セクション追加</h2>
              <button onClick={() => setAddOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SECTION_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => addSection(t)}
                  className="p-3 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-emerald-50 dark:hover:bg-gray-800 text-left"
                >
                  <p className="font-medium">{SECTION_LABELS[t] ?? t}</p>
                  <p className="text-xs text-gray-500">{t}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setHistoryOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">公開履歴</h2>
              <button onClick={() => setHistoryOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {history.length === 0 ? (
              <p className="text-gray-400">まだ公開履歴がありません</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.map((h) => {
                  const by = Array.isArray(h.published_by) ? h.published_by[0] : h.published_by
                  return (
                    <li key={h.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm">{new Date(h.published_at).toLocaleString("ja-JP")}</p>
                        <p className="text-xs text-gray-500">{by?.display_name || by?.email || "-"} {h.note ? `· ${h.note}` : ""}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => rollback(h.id)}>この時点に戻す</Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// セクション型別 props 編集フォーム (汎用 JSON エディタ + メタ)
function SectionForm({
  section,
  onUpdateDraft,
  onUpdateMeta,
}: {
  section: Section
  onUpdateDraft: (props: Record<string, unknown>) => void
  onUpdateMeta: (patch: Partial<Section>) => void
}) {
  const [jsonText, setJsonText] = useState(JSON.stringify(section.draft_props, null, 2))
  const [parseError, setParseError] = useState<string | null>(null)

  const onJsonChange = (text: string) => {
    setJsonText(text)
    try {
      const parsed = JSON.parse(text)
      setParseError(null)
      onUpdateDraft(parsed)
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : "JSON エラー")
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base">{SECTION_LABELS[section.section_type] ?? section.section_type}</h3>
        <Badge variant="outline" className="text-xs">{section.section_type}</Badge>
      </div>

      <details className="border border-gray-200 dark:border-gray-800 rounded p-3" open>
        <summary className="cursor-pointer text-xs font-medium text-gray-500">A/B テスト設定</summary>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Label className="text-xs">variant_key (空欄で無効)</Label>
            <Input
              value={section.variant_key ?? ""}
              onChange={(e) => onUpdateMeta({ variant_key: e.target.value || null })}
              placeholder="hero_test_1"
            />
          </div>
          <div>
            <Label className="text-xs">weight</Label>
            <Input
              type="number"
              value={section.variant_weight}
              min={1}
              onChange={(e) => onUpdateMeta({ variant_weight: Number(e.target.value) || 1 })}
            />
          </div>
        </div>
        <p className="mt-1 text-[10px] text-gray-400">同じ variant_key を持つセクション群から weight 比でランダム抽選</p>
      </details>

      <div>
        <Label>props (JSON 編集)</Label>
        <Textarea
          value={jsonText}
          onChange={(e) => onJsonChange(e.target.value)}
          rows={20}
          className="font-mono text-xs"
        />
        {parseError && <p className="mt-1 text-xs text-red-500">{parseError}</p>}
      </div>

      <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <p className="font-medium">Tips</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>画像フィールドには Gemini 生成画像の URL または <code>supabase-image:UUID</code> を入力</li>
          <li>編集後 ~500ms で右ペインに反映 + 自動保存</li>
          <li>「公開する」を押すまで本番サイトには反映されません</li>
        </ul>
      </div>
    </div>
  )
}

function defaultPropsFor(type: string): Record<string, unknown> {
  const D: Record<string, Record<string, unknown>> = {
    hero: { headline: "見出しを入力", subheadline: "サブテキスト", cta_label: "CTA", cta_url: "/counselors", bg_image_url: null },
    hero_video: { headline: "見出し", subheadline: "サブ", cta_label: "CTA", cta_url: "/counselors", video_url: "", poster_url: "" },
    trust_bar: { items: [{ label: "信頼バッジ 1" }, { label: "信頼バッジ 2" }] },
    features: { columns: 3, items: [{ icon: "Heart", title: "特徴 1", body: "説明" }] },
    how_it_works: { items: [{ step: 1, title: "ステップ 1", body: "説明", image_url: null }] },
    counselor_showcase: { count: 3, filter: { level: "master" }, cta_url: "/counselors" },
    testimonials: { items: [{ name: "ユーザー名", role: "属性", comment: "本文", avatar_url: null, rating: 5 }] },
    media_logos: { logos: [] },
    pricing: { plans: [{ name: "プラン", price: "¥0", features: [], highlight: false }] },
    faq: { items: [{ q: "質問", a: "回答" }] },
    cta_banner: { headline: "見出し", subheadline: "サブ", cta_label: "CTA", cta_url: "/register", bg_image_url: null },
    tools_promo: { items: [{ href: "/tools/personality", icon: "BookHeart", title: "ツール名", body: "説明" }] },
    column_promo: { count: 3 },
    comparison_table: { columns: ["当社", "競合A"], rows: [{ label: "項目1", values: [true, false] }] },
    stats_counter: { items: [{ value: "1000", label: "実績", suffix: "+" }] },
    before_after: { items: [{ before: "Before", after: "After" }] },
    story: { headline: "ストーリー", body: "本文", image_url: null, author_name: "", author_role: "" },
    lead_capture: { headline: "メルマガ登録", subheadline: "週1回お届け", submit_label: "登録する", success_message: "ありがとうございます", list_id: "" },
    rich_text: { markdown: "本文を入力", max_width: "max-w-3xl" },
    marquee: { items: ["メッセージ1", "メッセージ2"] },
    video_embed: { headline: "動画", embed_url: "", caption: "" },
    certifications: { items: [{ label: "認定", image_url: "", link: "" }] },
  }
  return D[type] ?? {}
}
