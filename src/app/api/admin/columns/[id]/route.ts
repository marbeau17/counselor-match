import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId: actorId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (typeof body.slug === "string") updates.slug = body.slug
  if (typeof body.title === "string") updates.title = body.title
  if (typeof body.body === "string") updates.body = body.body
  if ("excerpt" in body) updates.excerpt = body.excerpt ?? null
  if ("category" in body) updates.category = body.category ?? null
  if ("published_at" in body) updates.published_at = body.published_at ?? null

  const { data: before } = await admin
    .from("columns")
    .select("slug, title, published_at")
    .eq("id", id)
    .single()

  const { data: column, error } = await admin
    .from("columns")
    .update(updates)
    .eq("id", id)
    .select("id, slug, title, published_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId,
    action: "published_at" in body
      ? (body.published_at ? "column.publish" : "column.unpublish")
      : "column.update",
    targetType: "column",
    targetId: id,
    before,
    after: column,
  })

  return NextResponse.json({ column })
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId: actorId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const { data: before } = await admin
    .from("columns")
    .select("slug, title")
    .eq("id", id)
    .single()

  const { error } = await admin.from("columns").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId,
    action: "column.delete",
    targetType: "column",
    targetId: id,
    before,
  })

  return NextResponse.json({ ok: true })
}
