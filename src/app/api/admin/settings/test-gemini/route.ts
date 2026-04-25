import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi } from "@/lib/admin"
import { testGeminiKey } from "@/lib/gemini"
import { getSecretSetting } from "@/lib/secrets"

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  // body.key を渡せばその場テスト、無ければ DB の保存済みをテスト
  let plainKey: string | null = body.key ?? null
  if (!plainKey) {
    plainKey = await getSecretSetting("gemini.api_key")
  }
  if (!plainKey) {
    return NextResponse.json({ ok: false, message: "API キーが指定 / 保存されていません" }, { status: 400 })
  }
  const result = await testGeminiKey(plainKey)
  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
