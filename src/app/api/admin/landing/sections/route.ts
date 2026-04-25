import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

/** POST: 新規セクション作成 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const sectionType = String(body.section_type ?? "")
  const pageKey = String(body.page_key ?? "home")
  if (!sectionType) return NextResponse.json({ error: "section_type required" }, { status: 400 })

  const { data: maxRow } = await admin
    .from("landing_sections")
    .select("sort_order")
    .eq("page_key", pageKey)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextOrder = (maxRow?.sort_order ?? 0) + 10

  const { data, error } = await admin
    .from("landing_sections")
    .insert({
      page_key: pageKey,
      section_type: sectionType,
      sort_order: nextOrder,
      is_visible: true,
      draft_props: body.draft_props ?? {},
      published_props: null,
    })
    .select("id, section_type, sort_order")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId: userId,
    action: "landing.section.create",
    targetType: "landing_section",
    targetId: data.id,
    after: { section_type: sectionType },
  })

  return NextResponse.json({ section: data })
}

/** PUT: 並び順 bulk update */
export async function PUT(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const orders = body.orders as { id: string; sort_order: number }[] | undefined
  if (!orders || !Array.isArray(orders)) {
    return NextResponse.json({ error: "orders array required" }, { status: 400 })
  }

  for (const o of orders) {
    await admin
      .from("landing_sections")
      .update({ sort_order: o.sort_order, updated_at: new Date().toISOString() })
      .eq("id", o.id)
  }

  await logAdminAction({
    actorId: userId,
    action: "landing.section.reorder",
    targetType: "landing_section",
    note: `${orders.length} sections`,
  })

  return NextResponse.json({ ok: true })
}
