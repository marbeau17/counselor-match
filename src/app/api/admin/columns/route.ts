import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId: actorId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const { slug, title } = body
  if (!slug || !title) {
    return NextResponse.json({ error: "slug と title は必須です" }, { status: 400 })
  }

  const insert = {
    slug,
    title,
    body: body.body ?? "",
    excerpt: body.excerpt ?? null,
    category: body.category ?? null,
    author_id: actorId,
    published_at: body.published_at ?? null,
  }

  const { data: column, error } = await admin
    .from("columns")
    .insert(insert)
    .select("id, slug")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId,
    action: "column.create",
    targetType: "column",
    targetId: column.id,
    after: { slug: column.slug, title },
  })

  return NextResponse.json({ column })
}
