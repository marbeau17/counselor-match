import { getAdminClient } from "@/lib/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { ReportRowActions } from "./row-actions"
import Link from "next/link"

interface SearchParams {
  status?: string
  page?: string
}

const PAGE_SIZE = 30

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const status = sp.status || "pending"
  const page = Math.max(1, Number(sp.page) || 1)

  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  type P = { id?: string; full_name?: string; display_name?: string }
  type ReportRow = {
    id: string
    target_type: string
    target_id: string
    reason: string
    status: string
    resolved_at: string | null
    resolution_note: string | null
    created_at: string
    reporter: P | P[] | null
  }

  let query = admin
    .from("reports")
    .select(
      "id, target_type, target_id, reason, status, resolved_at, resolution_note, created_at, reporter:profiles!reports_reporter_id_fkey(id, email, display_name, full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (status !== "all") query = query.eq("status", status)

  const { data: reportsRaw, count } = await query
  const reports = reportsRaw as unknown as ReportRow[] | null
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">通報対応</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{count ?? 0} 件</p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <form className="flex gap-3" action="/dashboard/admin/reports">
            <select
              name="status"
              defaultValue={status}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option value="all">全て</option>
              <option value="pending">未対応</option>
              <option value="reviewing">調査中</option>
              <option value="resolved">対応済</option>
              <option value="dismissed">却下</option>
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
                <th className="px-4 py-3">通報者</th>
                <th className="px-4 py-3">対象</th>
                <th className="px-4 py-3">理由</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {(reports ?? []).map((r) => {
                const reporter = (Array.isArray(r.reporter) ? r.reporter[0] : r.reporter) as P | undefined
                const targetUrl = r.target_type === "counselor" ? `/dashboard/admin/counselors/${r.target_id}`
                  : r.target_type === "user" ? `/dashboard/admin/users/${r.target_id}`
                  : r.target_type === "review" ? `/dashboard/admin/reviews`
                  : r.target_type === "session" ? `/dashboard/admin/bookings/${r.target_id}`
                  : null
                return (
                  <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800 align-top">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/admin/users/${reporter?.id}`} className="text-emerald-600 hover:underline">
                        {reporter?.display_name || reporter?.full_name || "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{r.target_type}</Badge>
                      {targetUrl ? (
                        <Link href={targetUrl} className="ml-2 text-xs text-emerald-600 hover:underline">表示</Link>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <p className="truncate">{r.reason}</p>
                      {r.resolution_note && <p className="text-xs text-gray-500 mt-1">対応メモ: {r.resolution_note}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status === "pending" ? "destructive" : r.status === "resolved" ? "default" : "secondary"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ReportRowActions reportId={r.id} status={r.status} />
                    </td>
                  </tr>
                )
              })}
              {(!reports || reports.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">該当なし</td></tr>
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
              <Link href={`/dashboard/admin/reports?status=${status}&page=${page - 1}`}>
                <Button size="sm" variant="outline">前へ</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/dashboard/admin/reports?status=${status}&page=${page + 1}`}>
                <Button size="sm" variant="outline">次へ</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
