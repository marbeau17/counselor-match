import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"
import { publishLanding } from "@/lib/landing"

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { userId } = auth

  const body = await request.json().catch(() => ({}))
  const pageKey = String(body.page_key ?? "home")
  const note = body.note ? String(body.note) : undefined

  try {
    await publishLanding(pageKey, userId, note)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "publish failed" }, { status: 500 })
  }

  // ISR 即時再生成
  if (pageKey === "home") {
    revalidatePath("/")
  }

  await logAdminAction({
    actorId: userId,
    action: "landing.publish",
    targetType: "landing_page",
    note: pageKey,
  })

  return NextResponse.json({ ok: true })
}
