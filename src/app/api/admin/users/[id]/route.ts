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

  const body = await request.json().catch(() => ({}))
  const updates: Record<string, unknown> = {}

  if (typeof body.role === "string") {
    if (!["client", "counselor", "admin"].includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }
    updates.role = body.role
  }

  if (typeof body.is_banned === "boolean") {
    updates.is_banned = body.is_banned
    updates.banned_at = body.is_banned ? new Date().toISOString() : null
    updates.banned_reason = body.is_banned ? (body.banned_reason ?? null) : null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  // 自分自身の admin 権限剥奪 / BAN は禁止
  if (id === actorId && (updates.role !== undefined || updates.is_banned === true)) {
    return NextResponse.json({ error: "自分自身は変更できません" }, { status: 400 })
  }

  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const { data: before } = await admin
    .from("profiles")
    .select("role, is_banned, banned_reason")
    .eq("id", id)
    .single()

  const { data: updated, error } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select("id, role, is_banned, banned_reason")
    .single()

  if (error) {
    console.error("[admin/users PATCH]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    actorId,
    action: updates.role !== undefined ? "user.role_change" : (updates.is_banned ? "user.ban" : "user.unban"),
    targetType: "user",
    targetId: id,
    before,
    after: updated,
  })

  return NextResponse.json({ profile: updated })
}
