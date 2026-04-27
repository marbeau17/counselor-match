/**
 * 一回限りの Hero 画像生成エンドポイント。
 *
 * 認証: body.token が SUPABASE_SERVICE_ROLE_KEY と完全一致した場合のみ動作。
 * 動作: Gemini Banana Pro で hero 画像を生成 → Supabase Storage に upload →
 *       landing_sections (page_key=home, section_type=hero) の photo_url を更新。
 *
 * 一度使ったら 削除してください (Phase 2 では admin 画面のテンプレ機能で代替)。
 */

import { NextRequest, NextResponse } from "next/server"
import { generateImage } from "@/lib/gemini"
import { getAdminClient } from "@/lib/admin"
import { randomUUID } from "node:crypto"

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const expectedToken = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!expectedToken) {
    return NextResponse.json({ error: "service role not configured" }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const token = String(body.token ?? "")
  if (token !== expectedToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: "admin client unavailable" }, { status: 503 })

  // Japanese 'Girlfriend' (Kanojo-kan) aesthetic prompt — LP hero 用
  const prompt = String(body.prompt ?? `Japanese 'Girlfriend' aesthetic (Kanojo-kan) photography, soft-focus airy realism, slice-of-life lifestyle photo.
Subject: Charming young Japanese woman in her late 20s, soft porcelain skin, shoulder-length chestnut brown bob hair with airy see-through bangs framing the face.
Expression: Gentle, warm, relaxed, looking softly at the camera with a welcoming smile, conveying a calm and trustworthy atmosphere — like inviting someone to sit down and talk.
Outfit: Oversized cream-colored cable-knit sweater, chunky wool texture, voluminous balloon sleeves, exuding comfort and warmth.
Pose: Sitting comfortably indoors near a wide window, body slightly turned three-quarter view, hands gently holding a warm ceramic mug.
Setting: Cozy modern Japanese home interior with rustic warm wood elements, sheer curtain diffusing soft morning sunlight, indoor plant blurred in background, neutral beige and cream color palette.
Lighting: Natural side window light, soft and golden, gentle highlights on the face, warm cinematic glow.
Composition: Medium shot, vertical 4:5 aspect ratio for hero section.
Style: Editorial lifestyle photography, magazine-quality realism, no text, no logo, photorealistic, high detail, minimal grain.
Mood: Inviting, intimate, calm, heartwarming, makes the viewer feel safe to share their feelings.`)

  // 1. Gemini Banana Pro で生成
  let buffer: Buffer
  let mimeType: string
  try {
    const r = await generateImage({ prompt, aspectRatio: "4:5", sizePreset: "hd" })
    buffer = r.buffer
    mimeType = r.mimeType
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: `Gemini failed: ${err.message}` }, { status: 502 })
  }

  // 2. Supabase Storage に upload
  const id = randomUUID()
  const ext = mimeType.includes("jpeg") ? "jpg" : "png"
  const path = `hero/${id}.${ext}`
  const { error: upErr } = await admin.storage.from("public-images").upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  })
  if (upErr) {
    return NextResponse.json({ error: `Storage upload failed: ${upErr.message}` }, { status: 500 })
  }
  const { data: pub } = admin.storage.from("public-images").getPublicUrl(path)
  const publicUrl = pub.publicUrl

  // 3. generated_images に記録
  await admin.from("generated_images").insert({
    id,
    prompt: prompt.slice(0, 2000),
    aspect_ratio: "4:5",
    size_preset: "hd",
    storage_path: path,
    public_url: publicUrl,
    status: "succeeded",
    tags: ["hero", "lp", "japanese-aesthetic", "one-shot-generated"],
  })

  // 4. landing_sections の hero (draft + published) を新 photo_url に更新
  const { data: heroRow } = await admin
    .from("landing_sections")
    .select("id, draft_props, published_props")
    .eq("page_key", "home")
    .eq("section_type", "hero")
    .single()

  if (heroRow) {
    const newDraft = { ...(heroRow.draft_props as Record<string, unknown>), photo_url: publicUrl, photo_alt: "障子越しの朝の光と、ゆっくり湯気を見つめる人の手元" }
    const newPublished = heroRow.published_props
      ? { ...(heroRow.published_props as Record<string, unknown>), photo_url: publicUrl, photo_alt: "障子越しの朝の光と、ゆっくり湯気を見つめる人の手元" }
      : null
    await admin
      .from("landing_sections")
      .update({
        draft_props: newDraft,
        published_props: newPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", heroRow.id)
  }

  return NextResponse.json({
    ok: true,
    public_url: publicUrl,
    storage_path: path,
    bytes: buffer.length,
    updated_hero_section: !!heroRow,
  })
}
