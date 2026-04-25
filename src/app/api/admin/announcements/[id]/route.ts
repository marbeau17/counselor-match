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
  const updates: Record<string, unknown> = {}
  if (typeof body.title === "string") updates.title = body.title
  if (typeof body.body === "string") updates.body = body.body
  if (typeof body.is_published === "boolean") updates.is_published = body.is_published
  if ("ends_at" in body) updates.ends_at = body.ends_at ?? null
  if (body.level && ["info", "warning", "critical"].includes(body.level)) updates.level = body.level

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data: before } = await admin
    .from("announcements")
    .select("title, is_published")
    .eq("id", id)
    .single()

  const { data: announcement, error } = await admin
    .from("announcements")
    .update(updates)
    .eq("id", id)
    .select("id, title, is_published")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId,
    action: typeof body.is_published === "boolean"
      ? (body.is_published ? "announcement.publish" : "announcement.unpublish")
      : "announcement.update",
    targetType: "announcement",
    targetId: id,
    before,
    after: announcement,
  })

  return NextResponse.json({ announcement })
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

  const { error } = await admin.from("announcements").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId,
    action: "announcement.delete",
    targetType: "announcement",
    targetId: id,
  })

  return NextResponse.json({ ok: true })
}
