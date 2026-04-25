import { getAdminClient } from "@/lib/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { AnnouncementForm, AnnouncementRowActions } from "./client"

export default async function AdminAnnouncementsPage() {
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  const { data: announcements } = await admin
    .from("announcements")
    .select("id, title, body, level, starts_at, ends_at, is_published, created_at")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">お知らせ管理</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          サイト全体に表示されるお知らせを管理します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新規お知らせ</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>一覧</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">レベル</th>
                <th className="px-4 py-3">公開期間</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {(announcements ?? []).map((a) => (
                <tr key={a.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-md">{a.body}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={a.level === "critical" ? "destructive" : a.level === "warning" ? "secondary" : "default"}>
                      {a.level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {formatDate(a.starts_at)}
                    {a.ends_at ? ` 〜 ${formatDate(a.ends_at)}` : " 〜 ∞"}
                  </td>
                  <td className="px-4 py-3">
                    {a.is_published ? <Badge variant="default">公開</Badge> : <Badge variant="secondary">下書き</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AnnouncementRowActions id={a.id} isPublished={a.is_published} />
                  </td>
                </tr>
              ))}
              {(!announcements || announcements.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">該当なし</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
