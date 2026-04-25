import Link from "next/link"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"

interface SearchParams {
  action?: string
  target_type?: string
  page?: string
}

const PAGE_SIZE = 50

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const action = sp.action?.trim() || ""
  const targetType = sp.target_type?.trim() || ""
  const page = Math.max(1, Number(sp.page) || 1)

  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  let query = admin
    .from("admin_audit_log")
    .select("id, action, target_type, target_id, before, after, note, created_at, actor:profiles!admin_audit_log_actor_id_fkey(email, display_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (action) query = query.ilike("action", `%${action}%`)
  if (targetType) query = query.eq("target_type", targetType)

  const { data: logs, count } = await query
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">監査ログ</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{count ?? 0} 件</p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-3" action="/dashboard/admin/audit">
            <Input name="action" placeholder="action 検索 (e.g. user.ban)" defaultValue={action} />
            <select
              name="target_type"
              defaultValue={targetType}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option value="">全 target_type</option>
              <option value="user">user</option>
              <option value="counselor">counselor</option>
              <option value="booking">booking</option>
              <option value="payment">payment</option>
              <option value="review">review</option>
              <option value="report">report</option>
              <option value="column">column</option>
              <option value="announcement">announcement</option>
              <option value="site_seo">site_seo</option>
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
                <th className="px-4 py-3">操作者</th>
                <th className="px-4 py-3">action</th>
                <th className="px-4 py-3">target</th>
                <th className="px-4 py-3">差分</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((l) => {
                type P = { email?: string; display_name?: string }
                const actor = (Array.isArray(l.actor) ? l.actor[0] : l.actor) as P | undefined
                return (
                  <tr key={l.id} className="border-t border-gray-100 dark:border-gray-800 align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-xs">{formatDate(l.created_at)}</td>
                    <td className="px-4 py-3">{actor?.display_name || actor?.email || "-"}</td>
                    <td className="px-4 py-3"><code className="text-xs">{l.action}</code></td>
                    <td className="px-4 py-3">
                      {l.target_type ? <Badge variant="secondary">{l.target_type}</Badge> : "-"}
                      {l.target_id && <div className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">{l.target_id}</div>}
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      {l.before && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500">before</summary>
                          <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-900 overflow-x-auto">{JSON.stringify(l.before, null, 2)}</pre>
                        </details>
                      )}
                      {l.after && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-500">after</summary>
                          <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-900 overflow-x-auto">{JSON.stringify(l.after, null, 2)}</pre>
                        </details>
                      )}
                      {l.note && <p className="text-xs text-gray-500 mt-1">{l.note}</p>}
                    </td>
                  </tr>
                )
              })}
              {(!logs || logs.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">該当なし</td></tr>
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
              <Link href={`/dashboard/admin/audit?action=${encodeURIComponent(action)}&target_type=${targetType}&page=${page - 1}`}>
                <Button size="sm" variant="outline">前へ</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/dashboard/admin/audit?action=${encodeURIComponent(action)}&target_type=${targetType}&page=${page + 1}`}>
                <Button size="sm" variant="outline">次へ</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
