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
  // SEO/LLMO 拡張 (20260427)
  heading_level?: 'h1' | 'h2' | 'h3'
  seo_keywords?: string[] | null
  qa_pairs?: { question: string; answer: string }[] | null
  howto_steps?: { name: string; text: string; image_url?: string }[] | null
  citations?: { url: string; title: string; author?: string; date?: string }[] | null
  direct_answer?: string | null
}

/** ページレベル SEO 設定 (landing_pages テーブル) */
export type LandingPageSeo = {
  page_key: string
  seo_title: string | null
  seo_description: string | null
  seo_canonical: string | null
  og_image_url: string | null
  robots_index: boolean
  breadcrumb_label: string | null
  updated_at: string
}

/** 公開済みセクション (RLS 経由で is_visible AND published_props IS NOT NULL のみ) */
export async function fetchPublishedSections(pageKey = "home"): Promise<ResolvedSection[]> {
  const supabase = await createClient()
  if (!supabase) return pageKey === "home" ? DEFAULT_HOME_SECTIONS : []
  const { data, error } = await supabase
    .from("landing_sections")
    .select("id, section_type, sort_order, published_props, variant_key, variant_weight, heading_level, seo_keywords, qa_pairs, howto_steps, citations, direct_answer")
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
    heading_level: 'h1' | 'h2' | 'h3' | null
    seo_keywords: string[] | null
    qa_pairs: { question: string; answer: string }[] | null
    howto_steps: { name: string; text: string; image_url?: string }[] | null
    citations: { url: string; title: string; author?: string; date?: string }[] | null
    direct_answer: string | null
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
    heading_level: r.heading_level ?? undefined,
    seo_keywords: r.seo_keywords,
    qa_pairs: r.qa_pairs,
    howto_steps: r.howto_steps,
    citations: r.citations,
    direct_answer: r.direct_answer,
  })))
}

/** ページレベル SEO 設定取得 */
export async function fetchLandingPageSeo(pageKey = "home"): Promise<LandingPageSeo | null> {
  const supabase = await createClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("page_key", pageKey)
    .maybeSingle()
  if (error || !data) return null
  return data as unknown as LandingPageSeo
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
  const stripVariant = (s: WithVariant): ResolvedSection => ({
    id: s.id,
    section_type: s.section_type,
    sort_order: s.sort_order,
    props: s.props,
    heading_level: s.heading_level,
    seo_keywords: s.seo_keywords,
    qa_pairs: s.qa_pairs,
    howto_steps: s.howto_steps,
    citations: s.citations,
    direct_answer: s.direct_answer,
  })
  for (const s of input) {
    if (!s.variant_key) {
      result.push(stripVariant(s))
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
    result.push(stripVariant(chosen))
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
 *
 * 画像は Unsplash の royalty-free CDN URL を使用。
 * (next.config.ts の remotePatterns で images.unsplash.com を許可済み)
 */

// 日本文化的な静物 + 自然 + 後ろ姿の curated Unsplash photos
// 外国人顔写真を排除し、日本の生活文化 (和室・茶・墨・和紙・自然) で構成
// spec: docs/lp_redesign_spec.md §4.3 / 2026-04-26 日本人向け改訂
const IMG = {
  // Hero: Gemini Banana Pro 生成の Kanojo-kan (彼女感) 日本人女性ポートレート
  // (障子のある和モダンな室内、自然光、クリーム色のケーブルニット、湯気の立つマグカップ)
  hero_portrait: "https://ochflwclsjspmmpsutuf.supabase.co/storage/v1/object/public/public-images/hero/edd7d2ca-1c10-4861-9f28-a44c7483cc89.jpg",
  // Approach: 手・茶・紙の暖かいクローズアップ (顔写らず)
  feature_listen: "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80&auto=format&fit=crop", // 和茶碗を持つ手
  feature_mirror: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&q=80&auto=format&fit=crop", // 水面の反射
  feature_safe: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80&auto=format&fit=crop", // 日本庭園の石組み
  // Journey: 4 ステップ (検索/プロフィール/対話/記録)
  step_search: "https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=600&q=80&auto=format&fit=crop", // 和紙と筆
  step_profile: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80&auto=format&fit=crop", // 本と窓辺
  step_session: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80&auto=format&fit=crop", // 和室の朝
  step_journal: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80&auto=format&fit=crop", // ノート
  // Tools (静物 / 文化中性)
  tool_personality: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop",
  tool_tarot: "https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=800&q=80&auto=format&fit=crop",
  tool_compat: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80&auto=format&fit=crop",
  // Voice (testimonials): 写真を使わず初頭文字バッジで表示
  // (Avatar コンポーネントが avatar_url 不在時に initials を出す挙動を利用)
  testimonial_a: null,
  testimonial_k: null,
  testimonial_s: null,
  // Closing (CTA): 日本庭園の静謐
  cta: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&q=80&auto=format&fit=crop",
  // Gallery (日本の余白美)
  gallery_1: "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80&auto=format&fit=crop",   // 和茶碗
  gallery_2: "https://images.unsplash.com/photo-1474524955719-b9f87c50ce47?w=800&q=80&auto=format&fit=crop", // 朝霧
  gallery_3: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80&auto=format&fit=crop", // 苔と水
  gallery_4: "https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=800&q=80&auto=format&fit=crop", // 和紙と筆
  gallery_5: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop", // 本と窓辺
  gallery_6: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&auto=format&fit=crop", // 障子の光
  gallery_7: "https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=800&q=80&auto=format&fit=crop", // 花の影
  gallery_8: "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=800&q=80&auto=format&fit=crop", // 月夜
} as const

const DEFAULT_HOME_SECTIONS: ResolvedSection[] = [
  {
    id: "default-hero",
    section_type: "hero",
    sort_order: 10,
    props: {
      accent_label: "Holistic Counseling",
      headline: "「整える」ではなく、\n「ほどく」時間を。",
      subheadline: "急かされない場所で、誰かに、ゆっくり聞いてほしい――。\nホリスティック心理学に根ざした、伴走型のカウンセリング。",
      cta_label: "静かに話せる人を探す",
      cta_url: "/counselors",
      sub_cta_label: "まずは無料で診断してみる",
      sub_cta_url: "/tools/personality",
      photo_url: IMG.hero_portrait,
      photo_alt: "障子越しの朝の光と、ゆっくり湯気を見つめる人の手元",
    },
  },
  {
    id: "default-story",
    section_type: "story_narrative",
    sort_order: 15,
    props: {
      eyebrow: "Why we exist",
      heading: "急かされない場所で、誰かに、ゆっくり聞いてほしい。",
      paragraphs: [
        "何かを変えるためでなく、ただ自分の輪郭を確かめるために。カウンセリングは、特別なことが起きた人のものではありません。日々の中で少しずつ硬くなる呼吸を、もう一度ほどく時間です。",
        "私たちは、判断ではなく対話を、技法ではなく関係性を、ゴールではなく道のりを大切にする伴走者を集めています。",
        "あなたが今この場所にたどり着いたこと自体、すでに一歩です。何も決めなくていいので、まずは少しだけ、立ち止まってみませんか。",
      ],
      signature: "カウンセラーマッチ 編集部より",
    },
  },
  {
    id: "default-features",
    section_type: "features",
    sort_order: 30,
    props: {
      eyebrow: "Three commitments",
      heading: "3 つの、大切にしていること",
      columns: 3,
      items: [
        { title: "聴くこと", body: "解決を急がずに、まず理解する。あなたの言葉のリズムや沈黙そのものを大切にします。", image_url: IMG.feature_listen },
        { title: "映すこと", body: "関係性を鏡として、自分の内側に出会う。気づきは、対話の中でゆっくりと立ち上がります。", image_url: IMG.feature_mirror },
        { title: "守ること", body: "守秘・誠実さ・専門性で、対話の場そのものを支えます。安心して、ほどけてください。", image_url: IMG.feature_safe },
      ],
    },
  },
  {
    id: "default-gallery",
    section_type: "gallery",
    sort_order: 35,
    props: {
      eyebrow: "Quiet moments",
      heading: "日々の余白に、もう一度。",
      subheading: "言葉にならないもの、まだ形にならないもの。それらが息をする時間を。",
      items: [
        { image_url: IMG.gallery_1, alt: "手で湯気を包む朝", caption: "" },
        { image_url: IMG.gallery_2, alt: "湖の朝霧" },
        { image_url: IMG.gallery_3, alt: "苔と水" },
        { image_url: IMG.gallery_4, alt: "砂と石" },
        { image_url: IMG.gallery_5, alt: "本と窓辺" },
        { image_url: IMG.gallery_6, alt: "一輪挿し" },
        { image_url: IMG.gallery_7, alt: "花の影" },
        { image_url: IMG.gallery_8, alt: "月夜" },
      ],
    },
  },
  {
    id: "default-how_it_works",
    section_type: "how_it_works",
    sort_order: 40,
    props: {
      eyebrow: "Your journey",
      heading: "対話までの、ゆっくりとした 4 ステップ",
      items: [
        { step: 1, title: "静かに探す", body: "今の自分に合いそうな人を、テーマや言葉の温度から絞り込みます。", image_url: IMG.step_search },
        { step: 2, title: "声に触れる", body: "プロフィールや受け手の声から、その人の「在り方」を確かめます。", image_url: IMG.step_profile },
        { step: 3, title: "対話する", body: "オンラインの落ち着いた時間で、ただ話す、ただ聴いてもらう。", image_url: IMG.step_session },
        { step: 4, title: "書き残す", body: "気づきをジャーナルに置いておく。次の自分が読み返せるように。", image_url: IMG.step_journal },
      ],
    },
  },
  {
    id: "default-tools_promo",
    section_type: "tools_promo",
    sort_order: 50,
    props: {
      items: [
        { href: "/tools/personality", icon: "BookHeart", title: "パーソナリティ診断", body: "32タイプの性格構造から、今の自分の在り方を内省する。", image_url: IMG.tool_personality },
        { href: "/tools/tarot", icon: "Sparkles", title: "タロット・リフレクション", body: "カードを通じて、いま向き合うべきテーマを見つめ直す。", image_url: IMG.tool_tarot },
        { href: "/tools/compatibility", icon: "Heart", title: "相性診断", body: "関係性の相互作用を、構造として静かに眺める。", image_url: IMG.tool_compat },
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
      eyebrow: "Voices",
      heading: "言葉になった気づきたち",
      items: [
        { name: "A.M さん", role: "30 代 / 会社員", comment: "初めての利用でしたが、何かを話さなければ、と焦らずに済みました。誰かに「ここにいていい」と言ってもらえた時間でした。", rating: 5 },
        { name: "K.T さん", role: "40 代 / フリーランス", comment: "解決のためではなく、整理のための場所でした。話しているうちに、自分が本当に困っていたのは別のことだと気づけました。", rating: 5 },
        { name: "S.R さん", role: "20 代 / 学生", comment: "ジャーナルが残るのが嬉しいです。一週間後の自分が読むと、確かに何かが動いていることが分かります。", rating: 4 },
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
      eyebrow: "Begin softly",
      headline: "始めるためでなく、\nまず立ち止まるために。",
      subheadline: "無料登録で 1,000 円分のお試しポイント。気が向いたら、ゆっくり使ってください。",
      cta_label: "まず登録して見てみる",
      cta_url: "/register",
      bg_image_url: IMG.cta,
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
