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
  if (typeof body.is_hidden !== "boolean") {
    return NextResponse.json({ error: "is_hidden is required" }, { status: 400 })
  }

  const { data: before } = await admin
    .from("reviews")
    .select("is_hidden, hidden_reason")
    .eq("id", id)
    .single()

  const { data: updated, error } = await admin
    .from("reviews")
    .update({
      is_hidden: body.is_hidden,
      hidden_reason: body.is_hidden ? (body.hidden_reason ?? null) : null,
    })
    .eq("id", id)
    .select("id, is_hidden, hidden_reason")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId,
    action: body.is_hidden ? "review.hide" : "review.unhide",
    targetType: "review",
    targetId: id,
    before,
    after: updated,
  })

  return NextResponse.json({ review: updated })
}
