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
  const newStatus = body.status as string | undefined
  if (!newStatus || !["pending", "confirmed", "completed", "cancelled"].includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const { data: before } = await admin
    .from("bookings")
    .select("status")
    .eq("id", id)
    .single()

  const { data: updated, error } = await admin
    .from("bookings")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status")
    .single()

  if (error) {
    console.error("[admin/bookings PATCH]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    actorId,
    action: `booking.status.${newStatus}`,
    targetType: "booking",
    targetId: id,
    before,
    after: updated,
  })

  return NextResponse.json({ booking: updated })
}
