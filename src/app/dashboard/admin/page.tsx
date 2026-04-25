import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users, UserCheck, Calendar, CreditCard, Star, TrendingUp, MailOpen, Activity,
} from "lucide-react"
import { formatPrice, formatDate } from "@/lib/utils"

export default async function AdminDashboardPage() {
  // layout で auth + admin チェック済
  const supabase = await createClient()
  if (!supabase) return null

  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  const monthStartIso = monthStart.toISOString()

  const nowMs = new Date().getTime()
  const dayAgo = new Date(nowMs - 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(nowMs - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    usersCount, counselorsCount, bookingsCount, paymentsResp,
    monthBookings, dauCount, mauCount, ratingResp,
    recentBookings, recentUsers,
    weekBookings, weekUsers,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("counselors").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("amount, platform_fee, created_at").eq("status", "paid"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", monthStartIso),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("updated_at", dayAgo),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("updated_at", monthAgo),
    supabase.from("reviews").select("rating"),
    supabase.from("bookings").select("id, status, scheduled_at, price, counselor:counselors(profiles(display_name, full_name)), client:profiles!bookings_client_id_fkey(display_name, full_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("id, email, full_name, display_name, role, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("bookings").select("created_at").gte("created_at", sevenDaysAgo),
    supabase.from("profiles").select("created_at").gte("created_at", sevenDaysAgo),
  ])

  // 7 日間の日次集計
  const dayKey = (iso: string) => iso.slice(0, 10)
  const days: { date: string; bookings: number; users: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowMs - i * 24 * 60 * 60 * 1000)
    const k = d.toISOString().slice(0, 10)
    days.push({ date: k, bookings: 0, users: 0 })
  }
  for (const b of (weekBookings.data ?? []) as { created_at: string }[]) {
    const d = days.find((x) => x.date === dayKey(b.created_at))
    if (d) d.bookings++
  }
  for (const u of (weekUsers.data ?? []) as { created_at: string }[]) {
    const d = days.find((x) => x.date === dayKey(u.created_at))
    if (d) d.users++
  }
  const maxValue = Math.max(1, ...days.flatMap((d) => [d.bookings, d.users]))

  const totalRevenue = (paymentsResp.data ?? []).reduce((s: number, p: { platform_fee?: number }) => s + (p.platform_fee ?? 0), 0)
  const monthRevenue = (paymentsResp.data ?? [])
    .filter((p: { created_at?: string }) => p.created_at && p.created_at >= monthStartIso)
    .reduce((s: number, p: { platform_fee?: number }) => s + (p.platform_fee ?? 0), 0)

  const ratings = ((ratingResp.data ?? []) as { rating: number }[]).map((r) => r.rating)
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((s, x) => s + x, 0) / ratings.length) * 10) / 10
    : 0

  type Counselor = { profiles?: { display_name?: string; full_name?: string } }
  type Client = { display_name?: string; full_name?: string }
  type BookingRow = {
    id: string
    status: string
    scheduled_at: string
    price: number
    counselor?: Counselor | Counselor[]
    client?: Client | Client[]
  }

  const statusLabels: Record<string, string> = {
    pending: "確認待ち",
    confirmed: "確定",
    completed: "完了",
    cancelled: "キャンセル",
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">管理者ダッシュボード</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">プラットフォーム概要</p>
      </div>

      {/* 主要 KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Users} color="blue" value={usersCount.count ?? 0} label="総ユーザー" />
        <KpiCard icon={UserCheck} color="emerald" value={counselorsCount.count ?? 0} label="活動カウンセラー" />
        <KpiCard icon={Calendar} color="purple" value={bookingsCount.count ?? 0} label="総予約数" />
        <KpiCard icon={CreditCard} color="yellow" value={formatPrice(totalRevenue)} label="総収益" />
      </div>

      {/* 当月 + アクティビティ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={TrendingUp} color="emerald" value={monthBookings.count ?? 0} label="当月予約" />
        <KpiCard icon={CreditCard} color="emerald" value={formatPrice(monthRevenue)} label="当月収益" />
        <KpiCard icon={MailOpen} color="purple" value={dauCount.count ?? 0} label="DAU (24h)" />
        <KpiCard icon={Activity} color="blue" value={mauCount.count ?? 0} label="MAU (30d)" />
      </div>

      {/* 7 日アクティビティ */}
      <Card className="mb-6">
        <CardHeader><CardTitle>直近 7 日のアクティビティ</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {days.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-1 h-32">
                  <div
                    className="flex-1 bg-emerald-500 rounded-t transition-all"
                    style={{ height: `${(d.bookings / maxValue) * 100}%` }}
                    title={`予約 ${d.bookings} 件`}
                  />
                  <div
                    className="flex-1 bg-blue-500 rounded-t transition-all"
                    style={{ height: `${(d.users / maxValue) * 100}%` }}
                    title={`新規 ${d.users} 件`}
                  />
                </div>
                <span className="text-[10px] text-gray-500">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded" />予約</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" />新規ユーザー</span>
          </div>
        </CardContent>
      </Card>

      {/* 平均レビュー */}
      <Card className="mb-8">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="p-4 bg-yellow-100 dark:bg-yellow-950 rounded-lg">
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{avgRating > 0 ? `${avgRating} / 5.0` : "—"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">平均レビュースコア（{ratings.length} 件）</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>最近の予約</CardTitle></CardHeader>
          <CardContent>
            {recentBookings.data && recentBookings.data.length > 0 ? (
              <ul className="space-y-3">
                {(recentBookings.data as BookingRow[]).map((b) => {
                  const counselor = (Array.isArray(b.counselor) ? b.counselor[0] : b.counselor)
                  const client = (Array.isArray(b.client) ? b.client[0] : b.client)
                  return (
                    <li key={b.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {client?.display_name || client?.full_name || "クライアント"} → {counselor?.profiles?.display_name || counselor?.profiles?.full_name || "カウンセラー"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(b.scheduled_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{statusLabels[b.status] || b.status}</Badge>
                        <span className="font-medium">{formatPrice(b.price)}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-center py-6">データがありません</p>
            )}
            <Link href="/dashboard/admin/bookings" className="block mt-3 text-xs text-emerald-600 hover:underline text-right">すべての予約 →</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>新規ユーザー</CardTitle></CardHeader>
          <CardContent>
            {recentUsers.data && recentUsers.data.length > 0 ? (
              <ul className="space-y-3">
                {recentUsers.data.map((u) => (
                  <li key={u.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{u.display_name || u.full_name || u.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{u.role}</Badge>
                      <span className="text-xs text-gray-400">{formatDate(u.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-center py-6">データがありません</p>
            )}
            <Link href="/dashboard/admin/users" className="block mt-3 text-xs text-emerald-600 hover:underline text-right">すべてのユーザー →</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({ icon: Icon, color, value, label }: {
  icon: typeof Users
  color: "blue" | "emerald" | "purple" | "yellow"
  value: number | string
  label: string
}) {
  const bgColor = {
    blue: "bg-blue-100 dark:bg-blue-950",
    emerald: "bg-emerald-100 dark:bg-emerald-950",
    purple: "bg-purple-100 dark:bg-purple-950",
    yellow: "bg-yellow-100 dark:bg-yellow-950",
  }[color]
  const iconColor = {
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    purple: "text-purple-600 dark:text-purple-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
  }[color]
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
