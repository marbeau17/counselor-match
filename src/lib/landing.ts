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
  if (!supabase) return []
  const { data, error } = await supabase
    .from("landing_sections")
    .select("id, section_type, sort_order, published_props, variant_key, variant_weight")
    .eq("page_key", pageKey)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
  if (error || !data) return []
  type Row = {
    id: string
    section_type: string
    sort_order: number
    published_props: Record<string, unknown> | null
    variant_key: string | null
    variant_weight: number
  }
  const rows = (data as unknown as Row[]).filter((r) => r.published_props !== null)
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
