import Link from "next/link"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface SearchParams {
  status?: string
  page?: string
}

const PAGE_SIZE = 30

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const status = sp.status || "all"
  const page = Math.max(1, Number(sp.page) || 1)

  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  type Cli = { id?: string; full_name?: string; display_name?: string; email?: string }
  type CounselorWithProfile = { id?: string; profiles?: Cli | Cli[] | null }
  type BookingRow = {
    id: string
    status: string
    scheduled_at: string
    duration_minutes: number
    price: number
    session_type: string
    created_at: string
    client: Cli | Cli[] | null
    counselor: CounselorWithProfile | CounselorWithProfile[] | null
  }

  let query = admin
    .from("bookings")
    .select(
      "id, status, scheduled_at, duration_minutes, price, session_type, created_at, client:profiles!bookings_client_id_fkey(id, email, full_name, display_name), counselor:counselors!bookings_counselor_id_fkey(id, profiles!counselors_user_id_fkey(email, full_name, display_name))",
      { count: "exact" }
    )
    .order("scheduled_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (status !== "all") query = query.eq("status", status)

  const { data: bookingsRaw, count } = await query
  const bookings = bookingsRaw as unknown as BookingRow[] | null
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">予約管理</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{count ?? 0} 件</p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <form className="flex gap-3" action="/dashboard/admin/bookings">
            <select
              name="status"
              defaultValue={status}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option value="all">全ステータス</option>
              <option value="pending">承認待ち</option>
              <option value="confirmed">確定</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
            <Button type="submit">適用</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">日時</th>
                <th className="px-4 py-3">クライアント</th>
                <th className="px-4 py-3">カウンセラー</th>
                <th className="px-4 py-3">形式</th>
                <th className="px-4 py-3">金額</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {(bookings ?? []).map((b) => {
                const client = (Array.isArray(b.client) ? b.client[0] : b.client) as Cli | undefined
                const cRaw = (Array.isArray(b.counselor) ? b.counselor[0] : b.counselor) as CounselorWithProfile | undefined
                const cProfile = (Array.isArray(cRaw?.profiles) ? cRaw?.profiles?.[0] : cRaw?.profiles) as Cli | undefined
                return (
                  <tr key={b.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3">{formatDate(b.scheduled_at)}</td>
                    <td className="px-4 py-3">{client?.display_name || client?.full_name || client?.email || "-"}</td>
                    <td className="px-4 py-3">{cProfile?.display_name || cProfile?.full_name || cProfile?.email || "-"}</td>
                    <td className="px-4 py-3"><Badge variant="secondary">{b.session_type}</Badge></td>
                    <td className="px-4 py-3">¥{b.price}</td>
                    <td className="px-4 py-3">
                      <Badge variant={b.status === "cancelled" ? "destructive" : b.status === "completed" ? "default" : "secondary"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/admin/bookings/${b.id}`}>
                        <Button size="sm" variant="outline">詳細</Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {(!bookings || bookings.length === 0) && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">該当なし</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">{page} / {totalPages} ページ</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/dashboard/admin/bookings?status=${status}&page=${page - 1}`}>
                <Button size="sm" variant="outline">前へ</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/dashboard/admin/bookings?status=${status}&page=${page + 1}`}>
                <Button size="sm" variant="outline">次へ</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
