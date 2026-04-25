import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"
import { syncSectionImageUses } from "@/lib/landing"

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const f of [
    "sort_order", "is_visible", "draft_props", "variant_key", "variant_weight",
    // SEO/LLMO 列 (20260427)
    "heading_level", "seo_keywords", "qa_pairs", "howto_steps", "citations", "direct_answer",
  ]) {
    if (f in body) updates[f] = body[f]
  }

  const { data: before } = await admin.from("landing_sections").select("draft_props, is_visible, variant_key").eq("id", id).single()

  const { data, error } = await admin
    .from("landing_sections")
    .update(updates)
    .eq("id", id)
    .select("id, draft_props")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if ("draft_props" in body && data?.draft_props) {
    await syncSectionImageUses(id, data.draft_props as Record<string, unknown>)
  }

  await logAdminAction({
    actorId: userId,
    action: "landing.section.update",
    targetType: "landing_section",
    targetId: id,
    before,
  })

  return NextResponse.json({ section: data })
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  await admin.from("landing_sections").delete().eq("id", id)
  await logAdminAction({ actorId: userId, action: "landing.section.delete", targetType: "landing_section", targetId: id })
  return NextResponse.json({ ok: true })
}
