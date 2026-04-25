import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId: actorId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  if (!body.title || !body.body) {
    return NextResponse.json({ error: "title と body は必須です" }, { status: 400 })
  }
  if (body.level && !["info", "warning", "critical"].includes(body.level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 })
  }

  const { data: announcement, error } = await admin
    .from("announcements")
    .insert({
      title: body.title,
      body: body.body,
      level: body.level || "info",
      ends_at: body.ends_at ?? null,
      created_by: actorId,
      is_published: false,
    })
    .select("id, title")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId,
    action: "announcement.create",
    targetType: "announcement",
    targetId: announcement.id,
    after: announcement,
  })

  return NextResponse.json({ announcement })
}
