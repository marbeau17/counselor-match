import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin"

export type SectionRow = {
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
  created_at: string
  updated_at: string
}

export type ResolvedSection = {
  id: string
  section_type: string
  sort_order: number
  props: Record<string, unknown>
}

/** 公開済みセクション (RLS 経由で is_visible AND published_props IS NOT NULL のみ) */
export async function fetchPublishedSections(pageKey = "home"): Promise<ResolvedSection[]> {
  const supabase = await createClient()
  if (!supabase) return pageKey === "home" ? DEFAULT_HOME_SECTIONS : []
  const { data, error } = await supabase
    .from("landing_sections")
    .select("id, section_type, sort_order, published_props, variant_key, variant_weight")
    .eq("page_key", pageKey)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
  if (error || !data) return pageKey === "home" ? DEFAULT_HOME_SECTIONS : []
  type Row = {
    id: string
    section_type: string
    sort_order: number
    published_props: Record<string, unknown> | null
    variant_key: string | null
    variant_weight: number
  }
  const rows = (data as unknown as Row[]).filter((r) => r.published_props !== null)
  if (rows.length === 0 && pageKey === "home") return DEFAULT_HOME_SECTIONS
  return resolveVariants(rows.map((r) => ({
    id: r.id,
    section_type: r.section_type,
    sort_order: r.sort_order,
    props: r.published_props!,
    variant_key: r.variant_key,
    variant_weight: r.variant_weight,
  })))
}

/** 管理側プレビュー用 — draft_props を読む (service_role 必須) */
export async function fetchDraftSections(pageKey = "home"): Promise<ResolvedSection[]> {
  const admin = getAdminClient()
  if (!admin) return []
  const { data } = await admin
    .from("landing_sections")
    .select("id, section_type, sort_order, draft_props, is_visible, variant_key, variant_weight")
    .eq("page_key", pageKey)
    .order("sort_order", { ascending: true })
  type Row = {
    id: string
    section_type: string
    sort_order: number
    draft_props: Record<string, unknown>
    is_visible: boolean
    variant_key: string | null
    variant_weight: number
  }
  const rows = ((data as unknown as Row[]) ?? []).filter((r) => r.is_visible)
  return resolveVariants(rows.map((r) => ({
    id: r.id,
    section_type: r.section_type,
    sort_order: r.sort_order,
    props: r.draft_props,
    variant_key: r.variant_key,
    variant_weight: r.variant_weight,
  })))
}

type WithVariant = ResolvedSection & {
  variant_key: string | null
  variant_weight: number
}

/** 同じ variant_key を持つセクション群から weight 比でランダム選択 */
function resolveVariants(input: WithVariant[]): ResolvedSection[] {
  const groups = new Map<string, WithVariant[]>()
  const result: ResolvedSection[] = []
  for (const s of input) {
    if (!s.variant_key) {
      result.push({ id: s.id, section_type: s.section_type, sort_order: s.sort_order, props: s.props })
      continue
    }
    const arr = groups.get(s.variant_key) ?? []
    arr.push(s)
    groups.set(s.variant_key, arr)
  }
  for (const [, arr] of groups) {
    const total = arr.reduce((a, b) => a + Math.max(1, b.variant_weight), 0)
    const r = Math.random() * total
    let acc = 0
    let chosen = arr[0]
    for (const s of arr) {
      acc += Math.max(1, s.variant_weight)
      if (r < acc) { chosen = s; break }
    }
    result.push({ id: chosen.id, section_type: chosen.section_type, sort_order: chosen.sort_order, props: chosen.props })
  }
  return result.sort((a, b) => a.sort_order - b.sort_order)
}

/** 公開: draft_props を published_props にコピー + snapshot 作成 */
export async function publishLanding(pageKey: string, publishedBy: string, note?: string) {
  const admin = getAdminClient()
  if (!admin) throw new Error("Service role not configured")

  const { data: sections, error: fetchErr } = await admin
    .from("landing_sections")
    .select("*")
    .eq("page_key", pageKey)
    .order("sort_order", { ascending: true })
  if (fetchErr) throw new Error(fetchErr.message)

  await admin.from("landing_publish_history").insert({
    page_key: pageKey,
    snapshot: sections,
    published_by: publishedBy,
    note: note ?? null,
  })

  const now = new Date().toISOString()
  type SectionMin = { id: string; draft_props: Record<string, unknown> }
  for (const s of (sections as unknown as SectionMin[]) ?? []) {
    await admin
      .from("landing_sections")
      .update({ published_props: s.draft_props, published_at: now, updated_at: now })
      .eq("id", s.id)
  }
}

/** 画像 ↔ セクションの紐付けを props を走査して再構築 */
export async function syncSectionImageUses(sectionId: string, props: Record<string, unknown>) {
  const admin = getAdminClient()
  if (!admin) return

  const found: { fieldPath: string; imageId: string }[] = []
  walk(props, "", (path, value) => {
    if (typeof value === "string" && value.startsWith("supabase-image:")) {
      const imageId = value.slice("supabase-image:".length)
      found.push({ fieldPath: path, imageId })
    }
  })

  await admin.from("landing_section_image_uses").delete().eq("section_id", sectionId)
  if (found.length === 0) return

  await admin.from("landing_section_image_uses").insert(
    found.map((f) => ({
      section_id: sectionId,
      image_id: f.imageId,
      field_path: f.fieldPath,
    }))
  )
}

/**
 * DB 未設定 / landing_sections が空 の時に使う既定セクション。
 * supabase/migrations/20260425000010_landing_pages.sql の seed 内容と同期。
 */
const DEFAULT_HOME_SECTIONS: ResolvedSection[] = [
  {
    id: "default-hero",
    section_type: "hero",
    sort_order: 10,
    props: {
      headline: "心と関係を整える、伴走型のスピリチュアル・カウンセリング",
      subheadline: "ホリスティック心理学 × Soul Mirror Law。あなた本来の地図を、信頼できる伴走者と。",
      cta_label: "あなたに合う伴走者を探す",
      cta_url: "/counselors",
      bg_image_url: null,
    },
  },
  {
    id: "default-trust_bar",
    section_type: "trust_bar",
    sort_order: 20,
    props: {
      items: [
        { label: "厳選審査済み" },
        { label: "多軸レビュー" },
        { label: "守秘義務" },
        { label: "満足保証" },
      ],
    },
  },
  {
    id: "default-features",
    section_type: "features",
    sort_order: 30,
    props: {
      columns: 3,
      items: [
        { icon: "Heart", title: "ホリスティック心理学", body: "身体・心・感情・魂の4層から本質に向き合う。" },
        { icon: "Compass", title: "Soul Mirror Law", body: "関係性を鏡に、内側の真実を観る独自メソッド。" },
        { icon: "Shield", title: "守られた対話", body: "厳選カウンセラー・多軸レビュー・満足保証。" },
      ],
    },
  },
  {
    id: "default-how_it_works",
    section_type: "how_it_works",
    sort_order: 40,
    props: {
      items: [
        { step: 1, title: "悩みとアプローチで探す", body: "テーマと方法論からあなたに合う伴走者を絞り込みます。", image_url: null },
        { step: 2, title: "プロフィール・レビューを確認", body: "背景・専門・受け手の声を多角的に確かめます。", image_url: null },
        { step: 3, title: "セッションを予約", body: "オンライン・チャット・電話から選べます。", image_url: null },
        { step: 4, title: "振り返りジャーナルで統合", body: "気づきを記録し、日々の内省として根づかせます。", image_url: null },
      ],
    },
  },
  {
    id: "default-tools_promo",
    section_type: "tools_promo",
    sort_order: 50,
    props: {
      items: [
        { href: "/tools/personality", icon: "BookHeart", title: "パーソナリティ診断", body: "32タイプの性格構造から、今の自分の在り方を内省する。" },
        { href: "/tools/tarot", icon: "Sparkles", title: "タロット・リフレクション", body: "カードを通じて、いま向き合うべきテーマを見つめ直す。" },
        { href: "/tools/compatibility", icon: "Heart", title: "相性診断", body: "関係性の相互作用を構造的に把握する。" },
      ],
    },
  },
  {
    id: "default-counselor_showcase",
    section_type: "counselor_showcase",
    sort_order: 60,
    props: { count: 3, filter: { level: "master" }, cta_url: "/counselors" },
  },
  {
    id: "default-testimonials",
    section_type: "testimonials",
    sort_order: 70,
    props: {
      items: [
        { name: "A.M さん", role: "30代 / 会社員", comment: "初めての利用でしたが、自分の内側に丁寧に向き合えた時間でした。", rating: 5 },
        { name: "K.T さん", role: "40代 / フリーランス", comment: "関係性に対する見方が変わりました。", rating: 5 },
        { name: "S.R さん", role: "20代 / 学生", comment: "気づきを日々のジャーナルに残せるのが良いです。", rating: 4 },
      ],
    },
  },
  {
    id: "default-column_promo",
    section_type: "column_promo",
    sort_order: 80,
    props: { count: 3 },
  },
  {
    id: "default-cta_banner",
    section_type: "cta_banner",
    sort_order: 90,
    props: {
      headline: "あなたに合うカウンセラーを見つけませんか",
      subheadline: "無料登録で 1,000 円分のお試しチャージ付き",
      cta_label: "無料で始める",
      cta_url: "/register",
      bg_image_url: null,
    },
  },
]

function walk(obj: unknown, path: string, cb: (path: string, value: unknown) => void) {
  if (obj === null || obj === undefined) return
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => walk(v, `${path}[${i}]`, cb))
    return
  }
  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      walk(v, path ? `${path}.${k}` : k, cb)
    }
    return
  }
  cb(path, obj)
}
