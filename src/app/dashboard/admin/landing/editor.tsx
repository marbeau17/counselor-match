"use client"

import { useState, useTransition, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Trash2, Plus, X, History, ExternalLink, GripVertical, Copy } from "lucide-react"
import { SECTION_LABELS, SECTION_TYPES } from "@/components/landing/section-types"
import {
  DndContext, closestCenter, type DragEndEvent,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import {
  SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

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
  // SEO/LLMO 拡張 (20260427)
  heading_level: 'h1' | 'h2' | 'h3' | null
  seo_keywords: string[] | null
  qa_pairs: { question: string; answer: string }[] | null
  howto_steps: { name: string; text: string; image_url?: string }[] | null
  citations: { url: string; title: string; author?: string; date?: string }[] | null
  direct_answer: string | null
}

interface PageSeo {
  page_key: string
  seo_title: string | null
  seo_description: string | null
  seo_canonical: string | null
  og_image_url: string | null
  robots_index: boolean
  breadcrumb_label: string | null
}

interface History {
  id: string
  note: string | null
  published_at: string
  published_by: { display_name?: string; email?: string } | { display_name?: string; email?: string }[] | null
}

export function LandingEditor({
  initialSections,
  initialPageSeo,
  history,
}: {
  initialSections: Section[]
  initialPageSeo: PageSeo | null
  history: History[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [sections, setSections] = useState(initialSections)
  const [pageSeo, setPageSeo] = useState<PageSeo>(initialPageSeo ?? {
    page_key: "home",
    seo_title: null, seo_description: null, seo_canonical: null,
    og_image_url: null, robots_index: true, breadcrumb_label: "ホーム",
  })
  const [selectedId, setSelectedId] = useState<string | null>(initialSections[0]?.id ?? null)
  const [previewToken, setPreviewToken] = useState<string | null>(null)
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [pageSeoOpen, setPageSeoOpen] = useState(false)
  const [editorTab, setEditorTab] = useState<"content" | "seo" | "llmo">("content")
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const selected = sections.find((s) => s.id === selectedId) ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // プレビュートークン取得
  useEffect(() => {
    fetch(`/api/admin/landing/preview-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_key: "home" }),
    }).then((r) => r.json()).then((j) => setPreviewToken(j.token))
  }, [])

  // モーダルの Esc キーでの閉鎖対応 (a11y)
  useEffect(() => {
    if (!addOpen && !historyOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (addOpen) setAddOpen(false)
      if (historyOpen) setHistoryOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [addOpen, historyOpen])

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

  // dnd-kit ドラッグ完了
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.id === active.id)
    const newIdx = sections.findIndex((s) => s.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    const reordered = arrayMove(sections, oldIdx, newIdx)
    // sort_order を 10, 20, 30, ... に再割り当て (将来の挿入余地を確保)
    const withOrder = reordered.map((s, i) => ({ ...s, sort_order: (i + 1) * 10 }))
    setSections(withOrder)
    startTransition(async () => {
      await fetch(`/api/admin/landing/sections/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: withOrder.map((s) => ({ id: s.id, sort_order: s.sort_order })) }),
      })
      iframeRef.current?.contentWindow?.location.reload()
      router.refresh()
    })
  }

  // セクション複製
  const duplicate = (id: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/landing/sections/${id}/duplicate`, { method: "POST" })
      if (res.ok) {
        const j = await res.json()
        // refresh to pick up the new section in correct order
        router.refresh()
        setSelectedId(j.section.id)
      }
    })
  }

  // ページ SEO 設定保存
  const savePageSeo = () => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/landing/page/${pageSeo.page_key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageSeo),
      })
      if (res.ok) {
        setMessage("ページ SEO を保存しました")
        iframeRef.current?.contentWindow?.location.reload()
        router.refresh()
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "保存失敗")
      }
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
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" />セクション追加</Button>
          <Button size="sm" variant="outline" onClick={() => setPageSeoOpen((v) => !v)}>ページ SEO 設定</Button>
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline"><ExternalLink className="h-4 w-4 mr-1" />全画面プレビュー</Button>
            </a>
          )}
          <Button size="sm" variant="outline" onClick={() => setHistoryOpen(true)}><History className="h-4 w-4 mr-1" />公開履歴</Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={pending} onClick={publish}>公開する</Button>
        </div>
      </div>

      {/* ページレベル SEO 設定 (折りたたみパネル) */}
      {pageSeoOpen && (
        <Card className="mt-2 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">ページ全体の SEO 設定 (`{pageSeo.page_key}`)</h3>
              <Button size="sm" variant="ghost" aria-label="ページ SEO 設定を閉じる" onClick={() => setPageSeoOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>SEO Title (&lt;title&gt;)</Label>
                <Input value={pageSeo.seo_title ?? ""} onChange={(e) => setPageSeo({ ...pageSeo, seo_title: e.target.value || null })} placeholder="未設定なら layout 既定" />
              </div>
              <div>
                <Label>Canonical URL</Label>
                <Input value={pageSeo.seo_canonical ?? ""} onChange={(e) => setPageSeo({ ...pageSeo, seo_canonical: e.target.value || null })} placeholder="https://counselors.aicreonext.com/" />
              </div>
              <div className="md:col-span-2">
                <Label>Meta Description (~120 字)</Label>
                <Textarea rows={2} value={pageSeo.seo_description ?? ""} onChange={(e) => setPageSeo({ ...pageSeo, seo_description: e.target.value || null })} />
              </div>
              <div className="md:col-span-2">
                <Label>OG Image URL</Label>
                <Input value={pageSeo.og_image_url ?? ""} onChange={(e) => setPageSeo({ ...pageSeo, og_image_url: e.target.value || null })} placeholder="https://…/og.png" />
              </div>
              <div>
                <Label>パンくずラベル</Label>
                <Input value={pageSeo.breadcrumb_label ?? ""} onChange={(e) => setPageSeo({ ...pageSeo, breadcrumb_label: e.target.value || null })} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input id="robots-index" type="checkbox" checked={pageSeo.robots_index} onChange={(e) => setPageSeo({ ...pageSeo, robots_index: e.target.checked })} />
                <Label htmlFor="robots-index" className="cursor-pointer">検索エンジンに index 許可</Label>
              </div>
            </div>
            <Button size="sm" disabled={pending} onClick={savePageSeo}>ページ SEO を保存</Button>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {message && <p className="text-emerald-600 text-sm">{message}</p>}

      <div className="grid grid-cols-12 gap-4 mt-4" style={{ minHeight: "70vh" }}>
        {/* 左: セクションリスト (drag-and-drop) */}
        <div className="col-span-12 lg:col-span-3">
          <Card>
            <CardContent className="p-2 space-y-1">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {sections.map((s) => (
                    <SortableSectionItem
                      key={s.id}
                      section={s}
                      selected={selectedId === s.id}
                      onSelect={() => setSelectedId(s.id)}
                      onToggleVisible={() => updateMeta(s.id, { is_visible: !s.is_visible })}
                      onDuplicate={() => duplicate(s.id)}
                      onDelete={() => remove(s.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {sections.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">セクションがありません</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 中央: props 編集 (タブ式: 内容 / SEO / LLMO) */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="h-full">
            <CardContent className="p-4">
              {selected ? (
                <>
                  <div className="flex gap-1 mb-3 border-b border-gray-200 dark:border-gray-700">
                    {([
                      { v: "content", label: "内容" },
                      { v: "seo", label: "SEO" },
                      { v: "llmo", label: "LLMO" },
                    ] as const).map((t) => (
                      <button
                        key={t.v}
                        onClick={() => setEditorTab(t.v)}
                        className={`px-3 py-1.5 text-sm border-b-2 -mb-px transition-colors ${
                          editorTab === t.v
                            ? "border-emerald-600 text-emerald-700 font-medium"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {editorTab === "content" && (
                    <SectionForm
                      key={selected.id}
                      section={selected}
                      onUpdateDraft={(p) => updateDraft(selected.id, p)}
                      onUpdateMeta={(p) => updateMeta(selected.id, p)}
                    />
                  )}
                  {editorTab === "seo" && (
                    <SeoFieldsForm
                      key={selected.id + "seo"}
                      section={selected}
                      onUpdateMeta={(p) => updateMeta(selected.id, p)}
                    />
                  )}
                  {editorTab === "llmo" && (
                    <LlmoFieldsForm
                      key={selected.id + "llmo"}
                      section={selected}
                      onUpdateMeta={(p) => updateMeta(selected.id, p)}
                    />
                  )}
                </>
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-section-modal-title"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setAddOpen(false)}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 id="add-section-modal-title" className="text-lg font-bold">セクション追加</h2>
              <button aria-label="閉じる" onClick={() => setAddOpen(false)}><X className="h-5 w-5" /></button>
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-modal-title"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setHistoryOpen(false)}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 id="history-modal-title" className="text-lg font-bold">公開履歴</h2>
              <button aria-label="閉じる" onClick={() => setHistoryOpen(false)}><X className="h-5 w-5" /></button>
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

// =============================================================================
// SortableSectionItem (drag-and-drop 対応の左カラム行)
// =============================================================================
function SortableSectionItem({
  section,
  selected,
  onSelect,
  onToggleVisible,
  onDuplicate,
  onDelete,
}: {
  section: Section
  selected: boolean
  onSelect: () => void
  onToggleVisible: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-2 rounded text-sm border ${
        selected ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <div className="flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          aria-label="ドラッグして並び替え"
          className="cursor-grab text-gray-400 hover:text-gray-700 active:cursor-grabbing shrink-0 px-1"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onSelect} className="flex-1 min-w-0 text-left">
          <p className="font-medium truncate">{SECTION_LABELS[section.section_type] ?? section.section_type}</p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {section.heading_level && (
              <Badge variant="outline" className="text-[10px] uppercase">{section.heading_level}</Badge>
            )}
            {!section.is_visible && <Badge variant="secondary" className="text-[10px]">非表示</Badge>}
            {section.has_unpublished_changes && <Badge variant="default" className="text-[10px] bg-yellow-500">未公開</Badge>}
            {section.variant_key && <Badge variant="outline" className="text-[10px]">A/B: {section.variant_key}</Badge>}
          </div>
        </button>
      </div>
      <div className="flex gap-1 mt-2 ml-6">
        <button
          onClick={onToggleVisible}
          aria-label={section.is_visible ? "セクションを非表示にする" : "セクションを表示する"}
          title={section.is_visible ? "非表示にする" : "表示する"}
        >
          {section.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-gray-400" />}
        </button>
        <button onClick={onDuplicate} aria-label="セクションを複製" title="複製" className="text-blue-500">
          <Copy className="h-3 w-3" />
        </button>
        <button onClick={onDelete} aria-label="セクションを削除" className="text-red-500 ml-auto" title="削除">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// SeoFieldsForm (SEO タブ): heading_level / seo_keywords
// =============================================================================
function SeoFieldsForm({
  section,
  onUpdateMeta,
}: {
  section: Section
  onUpdateMeta: (patch: Partial<Section>) => void
}) {
  const [keywordsText, setKeywordsText] = useState((section.seo_keywords ?? []).join(", "))
  return (
    <div className="space-y-4 text-sm">
      <div>
        <Label className="mb-2 block">見出しレベル (heading_level)</Label>
        <div className="flex gap-2">
          {(["h1", "h2", "h3"] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onUpdateMeta({ heading_level: h })}
              className={`px-3 py-1.5 rounded border text-xs uppercase font-mono ${
                section.heading_level === h
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700"
                  : "border-gray-300 dark:border-gray-700 text-gray-600 hover:border-emerald-400"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ページ内で <code>h1</code> は 1 つのみが推奨。通常 hero のみ <code>h1</code>、それ以外は <code>h2</code> / <code>h3</code>。
        </p>
      </div>

      <div>
        <Label htmlFor="seo-keywords">SEO キーワード (カンマ区切り、内部メモ)</Label>
        <Input
          id="seo-keywords"
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          onBlur={() => {
            const arr = keywordsText.split(",").map((s) => s.trim()).filter(Boolean)
            onUpdateMeta({ seo_keywords: arr.length > 0 ? arr : null })
          }}
          placeholder="ホリスティック心理学, オンラインカウンセリング, …"
        />
        <p className="text-xs text-gray-500 mt-1">
          Google には直接シグナルではないが、ターゲットキーワードを記録しておくことでセクション内の本文を最適化する手がかりになります。
        </p>
      </div>

      <div className="border-t pt-3 text-xs text-gray-500 space-y-1">
        <p>📌 SEO のベストプラクティス:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>1 ページに <code>h1</code> は 1 つのみ</li>
          <li>見出し階層をスキップしない (h2 → h4 はNG)</li>
          <li>各画像に意味のある <code>alt</code></li>
          <li>関連ページへの内部リンクを必ず含める</li>
        </ul>
      </div>
    </div>
  )
}

// =============================================================================
// LlmoFieldsForm (LLMO タブ): qa_pairs / howto_steps / citations / direct_answer
// =============================================================================
function LlmoFieldsForm({
  section,
  onUpdateMeta,
}: {
  section: Section
  onUpdateMeta: (patch: Partial<Section>) => void
}) {
  const [directAnswer, setDirectAnswer] = useState(section.direct_answer ?? "")
  const [qaJson, setQaJson] = useState(JSON.stringify(section.qa_pairs ?? [], null, 2))
  const [citationsJson, setCitationsJson] = useState(JSON.stringify(section.citations ?? [], null, 2))

  const saveJson = (key: "qa_pairs" | "citations", text: string) => {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        onUpdateMeta({ [key]: parsed.length > 0 ? parsed : null } as Partial<Section>)
      }
    } catch {
      // ignore parse error during typing
    }
  }

  return (
    <div className="space-y-5 text-sm">
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded text-xs text-blue-900 dark:text-blue-100">
        🤖 <strong>LLMO (LLM Optimization)</strong>: ChatGPT / Perplexity / Gemini 等の AI 検索 / 引用に最適化するためのフィールドです。
        FAQPage / HowTo / Question schema を JSON-LD として出力します。
      </div>

      <div>
        <Label htmlFor="direct-answer">Direct Answer (50-150 字)</Label>
        <Textarea
          id="direct-answer"
          rows={3}
          value={directAnswer}
          onChange={(e) => setDirectAnswer(e.target.value)}
          onBlur={() => onUpdateMeta({ direct_answer: directAnswer || null })}
          placeholder="このセクションの内容を 1-2 文で要約。LLM が引用しやすい文体で。"
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1">{directAnswer.length} / 300 字</p>
      </div>

      <div>
        <Label htmlFor="qa-pairs">Q&A Pairs (JSON 配列、FAQPage schema 出力)</Label>
        <Textarea
          id="qa-pairs"
          rows={6}
          value={qaJson}
          onChange={(e) => setQaJson(e.target.value)}
          onBlur={() => saveJson("qa_pairs", qaJson)}
          className="font-mono text-xs"
          placeholder={`[\n  { "question": "質問1", "answer": "回答1" }\n]`}
        />
        <p className="text-xs text-gray-500 mt-1">
          配列内に <code>{`{question, answer}`}</code> オブジェクト。faq_qa セクション以外でも JSON-LD として出力されます。
        </p>
      </div>

      <div>
        <Label htmlFor="citations">Citations / 引用 (JSON 配列、E-E-A-T 強化)</Label>
        <Textarea
          id="citations"
          rows={6}
          value={citationsJson}
          onChange={(e) => setCitationsJson(e.target.value)}
          onBlur={() => saveJson("citations", citationsJson)}
          className="font-mono text-xs"
          placeholder={`[\n  { "url": "https://...", "title": "出典タイトル", "author": "著者", "date": "2026-04-26" }\n]`}
        />
      </div>

      <div className="border-t pt-3 text-xs text-gray-500 space-y-1">
        <p>📌 LLMO のベストプラクティス:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Direct Answer は質問形式に対する答えとして書く</li>
          <li>FAQ は Question/Answer ペアで構造化</li>
          <li>HowTo は番号付きステップ + 各ステップに画像</li>
          <li>引用元 URL を citations に明示すると信頼性 ↑</li>
          <li>著者の専門性 (E-E-A-T) を別の expert_authorship セクションで担保</li>
        </ul>
      </div>
    </div>
  )
}
