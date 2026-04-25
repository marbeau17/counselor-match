import { getAdminClient } from "@/lib/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

interface HealthCheck {
  name: string
  status: "ok" | "warn" | "error"
  detail: string
}

export default async function AdminHealthPage() {
  const checks: HealthCheck[] = []

  // Supabase service role
  const admin = getAdminClient()
  if (!admin) {
    checks.push({ name: "Supabase service role", status: "error", detail: "SUPABASE_SERVICE_ROLE_KEY 未設定" })
  } else {
    try {
      const { error } = await admin.from("profiles").select("id", { head: true, count: "exact" }).limit(1)
      if (error) {
        checks.push({ name: "Supabase service role", status: "error", detail: error.message })
      } else {
        checks.push({ name: "Supabase service role", status: "ok", detail: "接続成功" })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "unknown"
      checks.push({ name: "Supabase service role", status: "error", detail: msg })
    }
  }

  // Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    checks.push({ name: "Stripe", status: "warn", detail: "STRIPE_SECRET_KEY 未設定 (決済機能無効)" })
  } else {
    checks.push({ name: "Stripe", status: "ok", detail: "シークレット設定済み" })
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    checks.push({ name: "Stripe Webhook", status: "warn", detail: "STRIPE_WEBHOOK_SECRET 未設定" })
  } else {
    checks.push({ name: "Stripe Webhook", status: "ok", detail: "署名検証有効" })
  }

  // SMTP
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    checks.push({ name: "SMTP (Brevo)", status: "warn", detail: "SMTP 環境変数未設定" })
  } else {
    checks.push({ name: "SMTP (Brevo)", status: "ok", detail: `${process.env.SMTP_HOST}` })
  }

  // App URL
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    checks.push({ name: "Public URL", status: "warn", detail: "NEXT_PUBLIC_APP_URL 未設定" })
  } else {
    checks.push({ name: "Public URL", status: "ok", detail: process.env.NEXT_PUBLIC_APP_URL })
  }

  // Sentry
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    checks.push({ name: "Sentry", status: "warn", detail: "未設定 (エラートラッキング無効)" })
  } else {
    checks.push({ name: "Sentry", status: "ok", detail: "DSN 設定済み" })
  }

  // 集計
  const errorCount = checks.filter((c) => c.status === "error").length
  const warnCount = checks.filter((c) => c.status === "warn").length

  // テーブル件数 (簡易)
  let tableCounts: Array<{ name: string; count: number | null }> = []
  if (admin) {
    const tables = ["profiles", "counselors", "bookings", "payments", "reviews", "reports", "announcements", "site_seo", "admin_audit_log"]
    const results = await Promise.all(
      tables.map(async (t) => {
        const { count } = await admin.from(t).select("id", { head: true, count: "exact" })
        return { name: t, count: count ?? 0 }
      })
    )
    tableCounts = results
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">システムヘルス</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {errorCount > 0
            ? <span className="text-red-600">エラー {errorCount} 件</span>
            : warnCount > 0
              ? <span className="text-yellow-600">警告 {warnCount} 件</span>
              : <span className="text-emerald-600">問題なし</span>}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>環境チェック</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {checks.map((c) => (
              <li key={c.name} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                <div className="flex items-center gap-3">
                  {c.status === "ok" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {c.status === "warn" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {c.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="font-medium">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">{c.detail}</span>
                  <Badge variant={c.status === "ok" ? "default" : c.status === "warn" ? "secondary" : "destructive"}>
                    {c.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {tableCounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>テーブル件数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {tableCounts.map((t) => (
                <div key={t.name}>
                  <p className="text-xs text-gray-500">{t.name}</p>
                  <p className="text-lg font-semibold">{t.count ?? 0}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
