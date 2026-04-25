import Link from "next/link"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"

export default async function AdminColumnsPage() {
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  const { data: columns } = await admin
    .from("columns")
    .select("id, slug, title, category, published_at, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(200)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">コラム管理</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{columns?.length ?? 0} 件</p>
        </div>
        <Link href="/dashboard/admin/columns/new">
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />新規作成</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">スラッグ</th>
                <th className="px-4 py-3">カテゴリ</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3">更新日</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {(columns ?? []).map((c) => (
                <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-gray-500"><code className="text-xs">{c.slug}</code></td>
                  <td className="px-4 py-3">{c.category ? <Badge variant="secondary">{c.category}</Badge> : "-"}</td>
                  <td className="px-4 py-3">
                    {c.published_at
                      ? <Badge variant="default">公開中</Badge>
                      : <Badge variant="secondary">下書き</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/admin/columns/${c.id}`}>
                      <Button size="sm" variant="outline">編集</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {(!columns || columns.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">該当なし</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
