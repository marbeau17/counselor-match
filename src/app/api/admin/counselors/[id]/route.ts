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

  if (typeof body.is_active === "boolean") updates.is_active = body.is_active
  if (typeof body.level === "string") {
    if (!["starter", "professional", "master"].includes(body.level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 })
    }
    updates.level = body.level
  }
  if (typeof body.hourly_rate === "number" && body.hourly_rate >= 0) {
    updates.hourly_rate = Math.floor(body.hourly_rate)
  }
  if (typeof body.commission_rate === "number" && body.commission_rate >= 0 && body.commission_rate <= 1) {
    updates.commission_rate = body.commission_rate
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data: before } = await admin
    .from("counselors")
    .select("is_active, level, hourly_rate, commission_rate")
    .eq("id", id)
    .single()

  const { data: updated, error } = await admin
    .from("counselors")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, is_active, level, hourly_rate, commission_rate")
    .single()

  if (error) {
    console.error("[admin/counselors PATCH]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    actorId,
    action: typeof body.is_active === "boolean"
      ? (body.is_active ? "counselor.approve" : "counselor.suspend")
      : "counselor.update",
    targetType: "counselor",
    targetId: id,
    before,
    after: updated,
  })

  return NextResponse.json({ counselor: updated })
}
