import { createHmac } from "node:crypto"

const TTL_MS = 60 * 60 * 1000 // 1 時間

function getSecret(): string {
  const s = process.env.SETTINGS_ENCRYPTION_KEY
  if (!s) throw new Error("SETTINGS_ENCRYPTION_KEY 未設定 (preview token 署名に必要)")
  return s
}

/** プレビュートークン発行 ({pageKey}.{expiresAt}.{hmac}) */
export function issuePreviewToken(pageKey: string): string {
  const expires = Date.now() + TTL_MS
  const payload = `${pageKey}.${expires}`
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url")
  return `${payload}.${sig}`
}

/** トークン検証 → 成功で pageKey を返す。失敗で null。*/
export function verifyPreviewToken(token: string | undefined | null, expectedPageKey?: string): string | null {
  if (!token) return null
  const parts = token.split(".")
  if (parts.length !== 3) return null
  const [pageKey, expiresStr, sig] = parts
  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || expires < Date.now()) return null
  const expected = createHmac("sha256", getSecret()).update(`${pageKey}.${expires}`).digest("base64url")
  if (sig !== expected) return null
  if (expectedPageKey && pageKey !== expectedPageKey) return null
  return pageKey
}
