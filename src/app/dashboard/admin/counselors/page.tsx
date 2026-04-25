import Link from "next/link"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface SearchParams {
  q?: string
  active?: string
  page?: string
}

const PAGE_SIZE = 30

export default async function AdminCounselorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = sp.q?.trim() || ""
  const active = sp.active || "all"
  const page = Math.max(1, Number(sp.page) || 1)

  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  let query = admin
    .from("counselors")
    .select("id, user_id, level, title, is_active, hourly_rate, rating_average, rating_count, session_count, created_at, profiles!counselors_user_id_fkey(email, full_name, display_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (active === "active") query = query.eq("is_active", true)
  if (active === "pending") query = query.eq("is_active", false)

  const { data: counselors, count } = await query
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  // search は join 後のクライアント側で簡易フィルタ (PostgREST の or で join 列を直接フィルタしづらいため)
  type CounselorRow = NonNullable<typeof counselors>[number] & {
    profiles?: { email?: string; full_name?: string; display_name?: string } | { email?: string; full_name?: string; display_name?: string }[] | null
  }
  const filtered = (counselors as CounselorRow[] | null ?? []).filter((c) => {
    if (!q) return true
    const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
    const hay = `${p?.email ?? ""} ${p?.full_name ?? ""} ${p?.display_name ?? ""} ${c.title ?? ""}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">カウンセラー審査</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{count ?? 0} 名</p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-3" action="/dashboard/admin/counselors">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input name="q" placeholder="氏名 / メール / 肩書きで検索" defaultValue={q} className="pl-9" />
            </div>
            <select
              name="active"
              defaultValue={active}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option value="all">全状態</option>
              <option value="active">承認済</option>
              <option value="pending">未承認</option>
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
                <th className="px-4 py-3">氏名</th>
                <th className="px-4 py-3">レベル</th>
                <th className="px-4 py-3">単価</th>
                <th className="px-4 py-3">評価</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3">登録日</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
                return (
                  <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p?.display_name || p?.full_name || "-"}</div>
                      <div className="text-xs text-gray-500">{p?.email}</div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{c.level}</Badge></td>
                    <td className="px-4 py-3">¥{c.hourly_rate}</td>
                    <td className="px-4 py-3">{Number(c.rating_average ?? 0).toFixed(2)} ({c.rating_count})</td>
                    <td className="px-4 py-3">
                      {c.is_active
                        ? <Badge variant="default">承認済</Badge>
                        : <Badge variant="destructive">未承認</Badge>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/admin/counselors/${c.id}`}>
                        <Button size="sm" variant="outline">詳細</Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
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
              <Link href={`/dashboard/admin/counselors?q=${encodeURIComponent(q)}&active=${active}&page=${page - 1}`}>
                <Button size="sm" variant="outline">前へ</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/dashboard/admin/counselors?q=${encodeURIComponent(q)}&active=${active}&page=${page + 1}`}>
                <Button size="sm" variant="outline">次へ</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
