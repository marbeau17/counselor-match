import Link from "next/link"
import { notFound } from "next/navigation"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { CounselorActions } from "./actions"

export default async function AdminCounselorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  const { data: counselor } = await admin
    .from("counselors")
    .select("*, profiles!counselors_user_id_fkey(id, email, full_name, display_name, phone, avatar_url, is_banned, created_at)")
    .eq("id", id)
    .single()
  if (!counselor) notFound()

  const profile = Array.isArray(counselor.profiles) ? counselor.profiles[0] : counselor.profiles

  const [recentBookings, recentReviews] = await Promise.all([
    admin.from("bookings").select("id, status, scheduled_at, price").eq("counselor_id", id).order("scheduled_at", { ascending: false }).limit(10),
    admin.from("reviews").select("id, rating, comment, is_hidden, created_at").eq("counselor_id", id).order("created_at", { ascending: false }).limit(10),
  ])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/admin/counselors" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← カウンセラー一覧
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile?.display_name || profile?.full_name || "(無名)"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{counselor.level}</Badge>
            {counselor.is_active
              ? <Badge variant="default">承認済</Badge>
              : <Badge variant="destructive">未承認</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>カウンセラー情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="肩書き" value={counselor.title || "-"} />
            <Row label="単価" value={`¥${counselor.hourly_rate} / 時`} />
            <Row label="手数料率" value={`${(Number(counselor.commission_rate) * 100).toFixed(1)}%`} />
            <Row label="セッション数" value={counselor.session_count} />
            <Row label="平均評価" value={`${Number(counselor.rating_average ?? 0).toFixed(2)} (${counselor.rating_count}件)`} />
            <Row label="性格タイプ" value={counselor.personality_type || "-"} />
            <Row label="得意分野" value={(counselor.specialties ?? []).join(", ") || "-"} />
            <Row label="資格" value={(counselor.certifications ?? []).join(", ") || "-"} />
            <Row label="メソッド" value={(counselor.methodology ?? []).join(", ") || "-"} />
            <Row label="セッション形式" value={(counselor.available_session_types ?? []).join(", ") || "-"} />
            <Row label="登録日" value={formatDate(counselor.created_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>管理操作</CardTitle>
          </CardHeader>
          <CardContent>
            <CounselorActions
              counselorId={counselor.id}
              isActive={counselor.is_active}
              level={counselor.level}
              hourlyRate={counselor.hourly_rate}
              commissionRate={Number(counselor.commission_rate)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>自己紹介</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {counselor.bio || "(未入力)"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>直近の予約</CardTitle>
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
              {(recentBookings.data ?? []).map((b) => (
                <tr key={b.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2">{formatDate(b.scheduled_at)}</td>
                  <td className="px-4 py-2"><Badge variant="secondary">{b.status}</Badge></td>
                  <td className="px-4 py-2">¥{b.price}</td>
                </tr>
              ))}
              {(!recentBookings.data || recentBookings.data.length === 0) && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">予約なし</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>レビュー</CardTitle>
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
              {(recentReviews.data ?? []).map((r) => (
                <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-2">{r.rating} / 5</td>
                  <td className="px-4 py-2 max-w-md truncate">{r.comment || "-"}</td>
                  <td className="px-4 py-2">
                    {r.is_hidden ? <Badge variant="destructive">非表示</Badge> : <Badge variant="default">表示中</Badge>}
                  </td>
                </tr>
              ))}
              {(!recentReviews.data || recentReviews.data.length === 0) && (
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
