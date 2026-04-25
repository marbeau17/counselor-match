import Link from "next/link"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface SearchParams {
  q?: string
  role?: string
  page?: string
}

const PAGE_SIZE = 30

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = sp.q?.trim() || ""
  const role = sp.role || "all"
  const page = Math.max(1, Number(sp.page) || 1)

  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  let query = admin
    .from("profiles")
    .select("id, email, full_name, display_name, role, is_banned, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%,display_name.ilike.%${q}%`)
  if (role !== "all") query = query.eq("role", role)

  const { data: users, count } = await query
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ユーザー管理</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{count ?? 0} 名のユーザー</p>
        </div>
      </div>

      {/* Filter */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-3" action="/dashboard/admin/users">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input name="q" placeholder="email / 氏名で検索" defaultValue={q} className="pl-9" />
            </div>
            <select
              name="role"
              defaultValue={role}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option value="all">全ロール</option>
              <option value="admin">admin</option>
              <option value="counselor">counselor</option>
              <option value="client">client</option>
            </select>
            <Button type="submit">適用</Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">氏名</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">ロール</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3">登録日</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">{u.display_name || u.full_name || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{u.role}</Badge></td>
                  <td className="px-4 py-3">
                    {u.is_banned
                      ? <Badge variant="destructive">BAN</Badge>
                      : <Badge variant="default">アクティブ</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/admin/users/${u.id}`}>
                      <Button size="sm" variant="outline">詳細</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">該当なし</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {page} / {totalPages} ページ
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/dashboard/admin/users?q=${encodeURIComponent(q)}&role=${role}&page=${page - 1}`}>
                <Button size="sm" variant="outline">前へ</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/dashboard/admin/users?q=${encodeURIComponent(q)}&role=${role}&page=${page + 1}`}>
                <Button size="sm" variant="outline">次へ</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
