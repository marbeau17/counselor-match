import { getSecretSetting, getPlainSetting } from "@/lib/secrets"

const DEFAULT_MODEL = "gemini-3-pro-image-preview"

/**
 * Gemini Banana Pro 画像生成
 * REST: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 *
 * レスポンスの inline_data (base64 PNG) を Buffer に変換して返す。
 */
export async function generateImage(args: {
  prompt: string
  aspectRatio?: string
  sizePreset?: "standard" | "hd"
}): Promise<{ buffer: Buffer; mimeType: string }> {
  const apiKey = await getSecretSetting("gemini.api_key")
  if (!apiKey) {
    const e = new Error("Gemini API キーが未設定です。管理画面の「設定」から登録してください。")
    ;(e as Error & { code?: string }).code = "GEMINI_KEY_MISSING"
    throw e
  }
  const model = (await getPlainSetting("gemini.image_model")) || DEFAULT_MODEL

  // prompt にアスペクト + サイズ ヒントを付与
  const aspectHint = args.aspectRatio ? `, aspect ratio ${args.aspectRatio}` : ""
  const sizeHint = args.sizePreset === "hd" ? ", high definition, detailed" : ""
  const fullPrompt = `${args.prompt}${aspectHint}${sizeHint}`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
  const body = {
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gemini API エラー (${res.status}): ${text.slice(0, 500)}`)
  }

  type Inline = { data: string; mime_type?: string; mimeType?: string }
  type Part = { inline_data?: Inline; inlineData?: Inline; text?: string }
  type Candidate = { content?: { parts?: Part[] } }
  type Response = { candidates?: Candidate[] }
  const json = (await res.json()) as Response

  const parts = json.candidates?.[0]?.content?.parts ?? []
  for (const p of parts) {
    const inline: Inline | undefined = p.inline_data ?? p.inlineData
    if (inline?.data) {
      const mimeType = inline.mime_type ?? inline.mimeType ?? "image/png"
      const buffer = Buffer.from(inline.data, "base64")
      return { buffer, mimeType }
    }
  }

  // 画像が無くテキストだけ返ったケース
  const textOnly = parts.map((p) => p.text).filter(Boolean).join("\n")
  throw new Error(`Gemini が画像を返しませんでした${textOnly ? `: ${textOnly.slice(0, 300)}` : ""}`)
}

/** 疎通テスト (シンプルな text 生成で 200 を確認) */
export async function testGeminiKey(plainApiKey: string): Promise<{ ok: boolean; message: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(plainApiKey)}`
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 1 },
      }),
    })
    if (res.ok) return { ok: true, message: "疎通成功" }
    const text = await res.text()
    return { ok: false, message: `HTTP ${res.status}: ${text.slice(0, 200)}` }
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) }
  }
}
