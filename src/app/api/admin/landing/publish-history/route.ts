import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

/** GET: 公開履歴一覧 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const url = new URL(request.url)
  const pageKey = url.searchParams.get("page_key") || "home"

  const { data } = await admin
    .from("landing_publish_history")
    .select("id, page_key, note, published_at, published_by:profiles!landing_publish_history_published_by_fkey(display_name, email)")
    .eq("page_key", pageKey)
    .order("published_at", { ascending: false })
    .limit(50)

  return NextResponse.json({ history: data ?? [] })
}

/** POST: ロールバック (history.snapshot を draft_props に書き戻す) */
export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const historyId = String(body.history_id ?? "")
  if (!historyId) return NextResponse.json({ error: "history_id required" }, { status: 400 })

  const { data: hist } = await admin
    .from("landing_publish_history")
    .select("page_key, snapshot")
    .eq("id", historyId)
    .single()
  if (!hist) return NextResponse.json({ error: "history not found" }, { status: 404 })

  type Snap = {
    id: string
    section_type: string
    sort_order: number
    is_visible: boolean
    draft_props: Record<string, unknown>
    published_props: Record<string, unknown> | null
    variant_key: string | null
    variant_weight: number
  }
  const snap = hist.snapshot as Snap[]
  const now = new Date().toISOString()

  // 既存セクションを削除して snapshot で上書き
  await admin.from("landing_sections").delete().eq("page_key", hist.page_key)
  if (snap.length > 0) {
    await admin.from("landing_sections").insert(snap.map((s) => ({
      id: s.id,
      page_key: hist.page_key,
      section_type: s.section_type,
      sort_order: s.sort_order,
      is_visible: s.is_visible,
      draft_props: s.draft_props,
      published_props: s.published_props,
      variant_key: s.variant_key,
      variant_weight: s.variant_weight,
      updated_at: now,
    })))
  }

  if (hist.page_key === "home") {
    revalidatePath("/")
  }

  await logAdminAction({
    actorId: userId,
    action: "landing.rollback",
    targetType: "landing_page",
    targetId: historyId,
    note: hist.page_key,
  })

  return NextResponse.json({ ok: true })
}
