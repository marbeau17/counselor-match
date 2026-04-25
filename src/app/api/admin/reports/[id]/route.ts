import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

const ALLOWED = ["pending", "reviewing", "resolved", "dismissed"] as const

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
  const newStatus = body.status as string | undefined
  if (!newStatus || !(ALLOWED as readonly string[]).includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const updates: Record<string, unknown> = { status: newStatus }
  if (newStatus === "resolved" || newStatus === "dismissed") {
    updates.resolved_at = new Date().toISOString()
    updates.resolved_by = actorId
    updates.resolution_note = body.resolution_note ?? null
  }

  const { data: before } = await admin
    .from("reports")
    .select("status, resolution_note")
    .eq("id", id)
    .single()

  const { data: updated, error } = await admin
    .from("reports")
    .update(updates)
    .eq("id", id)
    .select("id, status")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId,
    action: `report.${newStatus}`,
    targetType: "report",
    targetId: id,
    before,
    after: updated,
  })

  return NextResponse.json({ report: updated })
}
