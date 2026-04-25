import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId: actorId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  if (!body.page_path) {
    return NextResponse.json({ error: "page_path は必須です" }, { status: 400 })
  }

  const payload = {
    page_path: body.page_path,
    title: body.title ?? null,
    description: body.description ?? null,
    og_image_url: body.og_image_url ?? null,
    og_title: body.og_title ?? body.title ?? null,
    og_description: body.og_description ?? body.description ?? null,
    canonical_url: body.canonical_url ?? null,
    keywords: body.keywords ?? null,
    noindex: !!body.noindex,
    custom_jsonld: body.custom_jsonld ?? null,
    updated_by: actorId,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await admin
    .from("site_seo")
    .upsert(payload, { onConflict: "page_path" })
    .select("id, page_path")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    actorId,
    action: "seo.upsert",
    targetType: "site_seo",
    targetId: data.id,
    after: { page_path: data.page_path },
  })

  return NextResponse.json({ seo: data })
}
