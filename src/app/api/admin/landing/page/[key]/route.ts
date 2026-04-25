import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

/**
 * ページレベル SEO 設定 (landing_pages テーブル)
 */

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const { data, error } = await admin
    .from("landing_pages")
    .select("*")
    .eq("page_key", key)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ page: data })
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const f of [
    "seo_title", "seo_description", "seo_canonical",
    "og_image_url", "robots_index", "breadcrumb_label",
  ]) {
    if (f in body) updates[f] = body[f]
  }

  // upsert (なければ INSERT)
  const { data, error } = await admin
    .from("landing_pages")
    .upsert({ page_key: key, ...updates }, { onConflict: "page_key" })
    .select("*")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId: userId,
    action: "landing.page.seo.update",
    targetType: "landing_page",
    targetId: key,
    after: updates,
  })

  return NextResponse.json({ page: data })
}
