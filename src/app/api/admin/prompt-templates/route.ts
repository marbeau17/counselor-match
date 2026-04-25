import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  if (!body.name || !body.prompt_template) {
    return NextResponse.json({ error: "name と prompt_template は必須" }, { status: 400 })
  }

  const { data, error } = await admin
    .from("prompt_templates")
    .insert({
      name: body.name,
      category: body.category ?? null,
      prompt_template: body.prompt_template,
      default_aspect_ratio: body.default_aspect_ratio ?? "1:1",
      default_size_preset: body.default_size_preset ?? "standard",
      variables: body.variables ?? [],
      is_favorite: !!body.is_favorite,
      created_by: userId,
    })
    .select("id, name")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({ actorId: userId, action: "template.create", targetType: "prompt_template", targetId: data.id })
  return NextResponse.json({ template: data })
}
