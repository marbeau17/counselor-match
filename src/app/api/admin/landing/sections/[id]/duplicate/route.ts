import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

/**
 * セクション複製 (sort_order を元 +5 で挿入)
 */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const { data: orig, error } = await admin.from("landing_sections").select("*").eq("id", id).single()
  if (error || !orig) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 })
  }

  type SectionRow = {
    id: string
    page_key: string
    section_type: string
    sort_order: number
    is_visible: boolean
    draft_props: Record<string, unknown>
    published_props: Record<string, unknown> | null
    variant_key: string | null
    variant_weight: number
    heading_level?: string | null
    seo_keywords?: string[] | null
    qa_pairs?: unknown
    howto_steps?: unknown
    citations?: unknown
    direct_answer?: string | null
  }
  const o = orig as SectionRow

  const newRow = {
    page_key: o.page_key,
    section_type: o.section_type,
    sort_order: o.sort_order + 5,
    is_visible: o.is_visible,
    draft_props: o.draft_props,
    published_props: null, // 複製は draft 状態
    variant_key: null, // variant は引き継がない
    variant_weight: 1,
    heading_level: o.heading_level ?? "h2",
    seo_keywords: o.seo_keywords ?? null,
    qa_pairs: o.qa_pairs ?? null,
    howto_steps: o.howto_steps ?? null,
    citations: o.citations ?? null,
    direct_answer: o.direct_answer ?? null,
  }

  const { data: created, error: insertErr } = await admin
    .from("landing_sections")
    .insert(newRow)
    .select("*")
    .single()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  await logAdminAction({
    actorId: userId,
    action: "landing.section.duplicate",
    targetType: "landing_section",
    targetId: (created as { id: string }).id,
    after: { source_id: id },
  })

  return NextResponse.json({ section: created })
}
