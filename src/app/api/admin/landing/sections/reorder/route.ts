import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

/**
 * セクションの batch reorder
 * body: { items: [{ id, sort_order }] }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const items = body.items as { id: string; sort_order: number }[] | undefined
  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: "items[] required" }, { status: 400 })
  }

  const now = new Date().toISOString()
  // 1 件ずつ UPDATE (PostgREST の bulk update は限界があるため)
  const errors: string[] = []
  for (const it of items) {
    const { error } = await admin
      .from("landing_sections")
      .update({ sort_order: it.sort_order, updated_at: now })
      .eq("id", it.id)
    if (error) errors.push(`${it.id}: ${error.message}`)
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 500 })
  }

  await logAdminAction({
    actorId: userId,
    action: "landing.section.reorder",
    targetType: "landing_page",
    targetId: "home",
    after: { count: items.length },
  })

  return NextResponse.json({ ok: true, updated: items.length })
}
