import { getAdminClient } from "@/lib/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { ReviewRowActions } from "./row-actions"
import Link from "next/link"

interface SearchParams {
  hidden?: string
  page?: string
}

const PAGE_SIZE = 30

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const hidden = sp.hidden || "all"
  const page = Math.max(1, Number(sp.page) || 1)

  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  type P = { id?: string; full_name?: string; display_name?: string; email?: string }
  type CounselorRel = { id?: string; profiles?: P | P[] | null }
  type ReviewRow = {
    id: string
    rating: number
    comment: string | null
    is_anonymous: boolean
    is_hidden: boolean
    hidden_reason: string | null
    created_at: string
    client: P | P[] | null
    counselor: CounselorRel | CounselorRel[] | null
  }

  let query = admin
    .from("reviews")
    .select(
      "id, rating, comment, is_anonymous, is_hidden, hidden_reason, created_at, client:profiles!reviews_client_id_fkey(id, email, display_name, full_name), counselor:counselors!reviews_counselor_id_fkey(id, profiles!counselors_user_id_fkey(email, display_name, full_name))",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (hidden === "hidden") query = query.eq("is_hidden", true)
  if (hidden === "visible") query = query.eq("is_hidden", false)

  const { data: reviewsRaw, count } = await query
  const reviews = reviewsRaw as unknown as ReviewRow[] | null
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">レビュー管理</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{count ?? 0} 件</p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <form className="flex gap-3" action="/dashboard/admin/reviews">
            <select
              name="hidden"
              defaultValue={hidden}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option value="all">全て</option>
              <option value="visible">表示中</option>
              <option value="hidden">非表示</option>
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
                <th className="px-4 py-3">投稿日</th>
                <th className="px-4 py-3">クライアント</th>
                <th className="px-4 py-3">カウンセラー</th>
                <th className="px-4 py-3">評価</th>
                <th className="px-4 py-3">本文</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {(reviews ?? []).map((r) => {
                const client = (Array.isArray(r.client) ? r.client[0] : r.client) as P | undefined
                const cRaw = (Array.isArray(r.counselor) ? r.counselor[0] : r.counselor) as CounselorRel | undefined
                const cProfile = (Array.isArray(cRaw?.profiles) ? cRaw?.profiles?.[0] : cRaw?.profiles) as P | undefined
                return (
                  <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800 align-top">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      {r.is_anonymous
                        ? <span className="text-gray-400">匿名</span>
                        : (
                          <Link href={`/dashboard/admin/users/${client?.id}`} className="text-emerald-600 hover:underline">
                            {client?.display_name || client?.full_name || "-"}
                          </Link>
                        )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/admin/counselors/${cRaw?.id}`} className="text-emerald-600 hover:underline">
                        {cProfile?.display_name || cProfile?.full_name || "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.rating} / 5</td>
                    <td className="px-4 py-3 max-w-md">
                      <p className="truncate">{r.comment || "-"}</p>
                      {r.hidden_reason && <p className="text-xs text-red-500 mt-1">理由: {r.hidden_reason}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {r.is_hidden ? <Badge variant="destructive">非表示</Badge> : <Badge variant="default">表示中</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ReviewRowActions reviewId={r.id} isHidden={r.is_hidden} />
                    </td>
                  </tr>
                )
              })}
              {(!reviews || reviews.length === 0) && (
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
              <Link href={`/dashboard/admin/reviews?hidden=${hidden}&page=${page - 1}`}>
                <Button size="sm" variant="outline">前へ</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/dashboard/admin/reviews?hidden=${hidden}&page=${page + 1}`}>
                <Button size="sm" variant="outline">次へ</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
