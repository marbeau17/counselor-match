import { createClient } from "@supabase/supabase-js"

interface NotifyArgs {
  userId: string
  type: string
  title: string
  body?: string
  url?: string
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

/** 通知を 1 件作成。失敗してもアプリは継続（fire-and-forget OK）。 */
export async function notify(args: NotifyArgs): Promise<{ ok: boolean; error?: string }> {
  const admin = getAdmin()
  if (!admin) return { ok: false, error: "service role not configured" }
  const { error } = await admin
    .from("notifications")
    .insert({
      user_id: args.userId,
      type: args.type,
      title: args.title,
      body: args.body || null,
      url: args.url || null,
    })
  if (error) {
    console.error("[notifications] insert error", error)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
