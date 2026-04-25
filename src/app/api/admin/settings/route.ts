import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"
import { setSecretSetting, setPlainSetting, hasSecretSetting, getPlainSetting } from "@/lib/secrets"

/** GET: 設定の状態 (secret は値を返さず "set" / "unset" のみ) */
export async function GET() {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const [hasGeminiKey, geminiModel] = await Promise.all([
    hasSecretSetting("gemini.api_key"),
    getPlainSetting("gemini.image_model"),
  ])

  return NextResponse.json({
    settings: {
      "gemini.api_key": { is_secret: true, status: hasGeminiKey ? "set" : "unset" },
      "gemini.image_model": { is_secret: false, value: geminiModel ?? "gemini-3-pro-image-preview" },
    },
  })
}

/** PUT: 設定保存。secret なら encrypt、plain ならそのまま */
export async function PUT(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { userId } = auth

  const body = await request.json().catch(() => ({}))
  const key = String(body.key ?? "")
  const value = body.value
  const isSecret = !!body.is_secret

  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 })
  if (typeof value !== "string") return NextResponse.json({ error: "value must be string" }, { status: 400 })

  try {
    if (isSecret) {
      await setSecretSetting({ key, plainValue: value, updatedBy: userId })
    } else {
      await setPlainSetting({ key, value, updatedBy: userId })
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "保存失敗"
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  await logAdminAction({
    actorId: userId,
    action: "settings.update",
    targetType: "app_settings",
    note: `key=${key} secret=${isSecret}`,
  })

  return NextResponse.json({ ok: true })
}
