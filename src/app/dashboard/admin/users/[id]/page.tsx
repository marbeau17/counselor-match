import Link from "next/link"
import { notFound } from "next/navigation"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { UserActions } from "./actions"

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, display_name, role, phone, avatar_url, is_banned, banned_at, banned_reason, created_at, updated_at")
    .eq("id", id)
    .single()
  if (!profile) notFound()

  // 関連情報を並行取得
  const [bookingsAsClient, reviewsAsClient, counselor] = await Promise.all([
    admin.from("bookings").select("id, status, scheduled_at, price").eq("client_id", id).order("scheduled_at", { ascending: false }).limit(10),
    admin.from("reviews").select("id, rating, comment, is_hidden, created_at").eq("client_id", id).order("created_at", { ascending: false }).limit(10),
    admin.from("counselors").select("id, level, is_active, hourly_rate, rating_average, session_count").eq("user_id", id).maybeSingle(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/admin/users" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
            ← ユーザー一覧
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {profile.display_name || profile.full_name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{profile.role}</Badge>
          {profile.is_banned && <Badge variant="destructive">BAN</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="ID" value={<code className="text-xs">{profile.id}</code>} />
            <Row label="氏名" value={profile.full_name || "-"} />
            <Row label="表示名" value={profile.display_name || "-"} />
            <Row label="電話" value={profile.phone || "-"} />
            <Row label="登録日" value={formatDate(profile.created_at)} />
            <Row label="最終更新" value={formatDate(profile.updated_at)} />
            {profile.is_banned && (
              <>
                <Row label="BAN 日時" value={profile.banned_at ? formatDate(profile.banned_at) : "-"} />
                <Row label="BAN 理由" value={profile.banned_reason || "-"} />
              </>
            )}
          </CardContent>
        </Card>

        {/* 操作 */}
        <Card>
          <CardHeader>
            <CardTitle>管理操作</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActions
              userId={profile.id}
              currentRole={profile.role}
              isBanned={profile.is_banned}
            />
          </CardContent>
        </Card>
      </div>

      {/* カウンセラープロファイル */}
      {counselor.data && (
        <Card>
          <CardHeader>
            <CardTitle>カウンセラー情報</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <Stat label="レベル" value={counselor.data.level} />
            <Stat label="状態" value={counselor.data.is_active ? "稼働中" : "停止中"} />
            <Stat label="単価" value={`¥${counselor.data.hourly_rate}/時`} />
            <Stat label="平均評価" value={`${Number(counselor.data.rating_average ?? 0).toFixed(2)} (${counselor.data.session_count}件)`} />
            <div className="col-span-2 sm:col-span-4">
              <Link href={`/dashboard/admin/counselors/${counselor.data.id}`}>
                <Button size="sm" variant="outline">カウンセラー詳細へ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 直近予約 */}
      <Card>
        <CardHeader>
          <CardTitle>直近の予約 (クライアントとして)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2">日時</th>
                <th className="px-4 py-2">状態</th>
                <th className="px-4 py-2">金額</th>
              </tr>
            </thead>
            <tbody>
              {(bookingsAsClient.data ?? []).map((b) => (
                <tr key={b.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2">{formatDate(b.scheduled_at)}</td>
                  <td className="px-4 py-2"><Badge variant="secondary">{b.status}</Badge></td>
                  <td className="px-4 py-2">¥{b.price}</td>
                </tr>
              ))}
              {(!bookingsAsClient.data || bookingsAsClient.data.length === 0) && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">予約なし</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 直近レビュー */}
      <Card>
        <CardHeader>
          <CardTitle>直近のレビュー</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2">投稿日</th>
                <th className="px-4 py-2">評価</th>
                <th className="px-4 py-2">本文</th>
                <th className="px-4 py-2">状態</th>
              </tr>
            </thead>
            <tbody>
              {(reviewsAsClient.data ?? []).map((r) => (
                <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-2">{r.rating} / 5</td>
                  <td className="px-4 py-2 max-w-md truncate">{r.comment || "-"}</td>
                  <td className="px-4 py-2">
                    {r.is_hidden ? <Badge variant="destructive">非表示</Badge> : <Badge variant="default">表示中</Badge>}
                  </td>
                </tr>
              ))}
              {(!reviewsAsClient.data || reviewsAsClient.data.length === 0) && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">レビューなし</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-gray-100 text-right">{value}</span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  )
}
