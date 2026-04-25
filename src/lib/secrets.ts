import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import { getAdminClient } from "@/lib/admin"

/**
 * SETTINGS_ENCRYPTION_KEY: 32 bytes hex (= 64 文字)
 * 生成: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
function getKey(): Buffer {
  const hex = process.env.SETTINGS_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error("SETTINGS_ENCRYPTION_KEY が未設定または 64 文字 hex ではありません")
  }
  return Buffer.from(hex, "hex")
}

export function encrypt(plain: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    enc.toString("base64"),
  ].join(".")
}

export function decrypt(payload: string): string {
  const key = getKey()
  const parts = payload.split(".")
  if (parts.length !== 3) throw new Error("invalid encrypted payload format")
  const [ivB64, tagB64, encB64] = parts
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"))
  decipher.setAuthTag(Buffer.from(tagB64, "base64"))
  const dec = Buffer.concat([
    decipher.update(Buffer.from(encB64, "base64")),
    decipher.final(),
  ])
  return dec.toString("utf8")
}

/** DB から暗号化済 secret を取得して復号 */
export async function getSecretSetting(key: string): Promise<string | null> {
  const admin = getAdminClient()
  if (!admin) return null
  const { data } = await admin
    .from("app_settings")
    .select("value_encrypted")
    .eq("key", key)
    .maybeSingle()
  if (!data?.value_encrypted) return null
  try {
    return decrypt(data.value_encrypted)
  } catch (e) {
    console.error(`[getSecretSetting] decrypt failed for ${key}`, e)
    return null
  }
}

/** DB から平文設定を取得 */
export async function getPlainSetting(key: string): Promise<string | null> {
  const admin = getAdminClient()
  if (!admin) return null
  const { data } = await admin
    .from("app_settings")
    .select("value_plain")
    .eq("key", key)
    .maybeSingle()
  return data?.value_plain ?? null
}

/** DB に secret を upsert (encrypt) */
export async function setSecretSetting(args: {
  key: string
  plainValue: string
  description?: string
  updatedBy?: string
}) {
  const admin = getAdminClient()
  if (!admin) throw new Error("Service role not configured")
  const encrypted = encrypt(args.plainValue)
  const { error } = await admin.from("app_settings").upsert({
    key: args.key,
    value_encrypted: encrypted,
    value_plain: null,
    is_secret: true,
    description: args.description ?? null,
    updated_by: args.updatedBy ?? null,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

export async function setPlainSetting(args: {
  key: string
  value: string
  description?: string
  updatedBy?: string
}) {
  const admin = getAdminClient()
  if (!admin) throw new Error("Service role not configured")
  const { error } = await admin.from("app_settings").upsert({
    key: args.key,
    value_encrypted: null,
    value_plain: args.value,
    is_secret: false,
    description: args.description ?? null,
    updated_by: args.updatedBy ?? null,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

/** secret が設定されているかだけ確認 (値は返さない) */
export async function hasSecretSetting(key: string): Promise<boolean> {
  const admin = getAdminClient()
  if (!admin) return false
  const { data } = await admin
    .from("app_settings")
    .select("value_encrypted")
    .eq("key", key)
    .maybeSingle()
  return !!data?.value_encrypted
}
