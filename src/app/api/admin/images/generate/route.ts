import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"
import { generateImage } from "@/lib/gemini"
import { randomUUID } from "node:crypto"

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const body = await request.json().catch(() => ({}))
  const prompt = String(body.prompt ?? "").trim()
  const aspectRatio = String(body.aspect_ratio ?? "1:1")
  const sizePreset = (body.size_preset === "hd" ? "hd" : "standard") as "hd" | "standard"
  const tags = Array.isArray(body.tags) ? (body.tags as string[]).map(String) : []
  const promptTemplateId = body.prompt_template_id ? String(body.prompt_template_id) : null

  if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 })

  let buffer: Buffer
  let mimeType: string
  try {
    const r = await generateImage({ prompt, aspectRatio, sizePreset })
    buffer = r.buffer
    mimeType = r.mimeType
  } catch (e: unknown) {
    const err = e as Error & { code?: string }
    const status = err.code === "GEMINI_KEY_MISSING" ? 503 : 502
    // 失敗ログを INSERT
    await admin.from("generated_images").insert({
      prompt,
      prompt_template_id: promptTemplateId,
      aspect_ratio: aspectRatio,
      size_preset: sizePreset,
      storage_path: "(failed)",
      public_url: "(failed)",
      status: "failed",
      error_message: err.message,
      tags,
      created_by: userId,
    })
    return NextResponse.json({ error: err.message }, { status })
  }

  const id = randomUUID()
  const ext = mimeType.includes("jpeg") ? "jpg" : "png"
  const path = `generated/${id}.${ext}`

  const { error: upErr } = await admin.storage.from("public-images").upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  })
  if (upErr) {
    return NextResponse.json({ error: `Storage upload failed: ${upErr.message}` }, { status: 500 })
  }

  const { data: pub } = admin.storage.from("public-images").getPublicUrl(path)
  const publicUrl = pub.publicUrl

  const { data: row, error: insErr } = await admin
    .from("generated_images")
    .insert({
      id,
      prompt,
      prompt_template_id: promptTemplateId,
      aspect_ratio: aspectRatio,
      size_preset: sizePreset,
      storage_path: path,
      public_url: publicUrl,
      status: "succeeded",
      tags,
      created_by: userId,
    })
    .select("id, public_url, prompt, aspect_ratio, size_preset, tags, created_at")
    .single()

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  await logAdminAction({
    actorId: userId,
    action: "image.generate",
    targetType: "generated_image",
    targetId: row.id,
    after: { prompt: prompt.slice(0, 100), aspect_ratio: aspectRatio },
  })

  return NextResponse.json({ image: row })
}
