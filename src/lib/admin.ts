import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

/**
 * admin ロールであることを確認し、認証済み user を返す。
 * - 未認証 → /login へリダイレクト
 * - admin でない → /dashboard へリダイレクト
 */
export async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (profile?.role !== "admin") redirect("/dashboard")
  return { user, supabase }
}

/** API route 用: admin チェック失敗時はレスポンスを返す関数として使う */
export async function requireAdminForApi(): Promise<
  { ok: true; userId: string; admin: ReturnType<typeof getAdminClient> }
  | { ok: false; status: number; error: string }
> {
  const supabase = await createClient()
  if (!supabase) return { ok: false, status: 503, error: "Service unavailable" }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401, error: "Unauthorized" }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (profile?.role !== "admin") return { ok: false, status: 403, error: "Forbidden" }
  const admin = getAdminClient()
  if (!admin) return { ok: false, status: 503, error: "Service role not configured" }
  return { ok: true, userId: user.id, admin }
}

/** service_role admin クライアント (RLS バイパス用) */
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createAdmin(url, key, { auth: { persistSession: false } })
}

/** 監査ログ書き込み (失敗してもアプリは継続) */
export async function logAdminAction(args: {
  actorId: string
  action: string
  targetType?: string
  targetId?: string
  before?: unknown
  after?: unknown
  note?: string
}) {
  const admin = getAdminClient()
  if (!admin) return
  const { error } = await admin.from("admin_audit_log").insert({
    actor_id: args.actorId,
    action: args.action,
    target_type: args.targetType ?? null,
    target_id: args.targetId ?? null,
    before: args.before ?? null,
    after: args.after ?? null,
    note: args.note ?? null,
  })
  if (error) console.error("[admin_audit_log] insert error", error)
}
