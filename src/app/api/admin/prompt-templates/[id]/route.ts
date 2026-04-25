import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

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
  for (const f of ["name", "category", "prompt_template", "default_aspect_ratio", "default_size_preset", "variables", "is_favorite"]) {
    if (f in body) updates[f] = body[f]
  }

  const { data, error } = await admin.from("prompt_templates").update(updates).eq("id", id).select("id, name").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({ actorId: userId, action: "template.update", targetType: "prompt_template", targetId: id })
  return NextResponse.json({ template: data })
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

  await admin.from("prompt_templates").delete().eq("id", id)
  await logAdminAction({ actorId: userId, action: "template.delete", targetType: "prompt_template", targetId: id })
  return NextResponse.json({ ok: true })
}
