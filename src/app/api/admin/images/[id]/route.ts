import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const { data: row } = await admin.from("generated_images").select("storage_path").eq("id", id).single()
  if (row?.storage_path && row.storage_path !== "(failed)") {
    await admin.storage.from("public-images").remove([row.storage_path])
  }
  await admin.from("generated_images").delete().eq("id", id)

  await logAdminAction({
    actorId: userId,
    action: "image.delete",
    targetType: "generated_image",
    targetId: id,
  })

  return NextResponse.json({ ok: true })
}
