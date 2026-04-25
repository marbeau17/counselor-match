import { getAdminClient } from "@/lib/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { SeoForm, SeoRowActions } from "./client"

export default async function AdminSeoPage() {
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  const { data: rows } = await admin
    .from("site_seo")
    .select("id, page_path, title, description, og_image_url, noindex, updated_at")
    .order("page_path", { ascending: true })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SEO 管理</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          ページ別のメタ情報・OGP・noindex を管理します。<code>/sitemap.xml</code> と <code>/robots.txt</code> は自動生成されます。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新規ページ SEO 追加</CardTitle>
        </CardHeader>
        <CardContent>
          <SeoForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>登録済みページ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">ページパス</th>
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">noindex</th>
                <th className="px-4 py-3">更新日</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3"><code className="text-xs">{r.page_path}</code></td>
                  <td className="px-4 py-3 max-w-md truncate">{r.title || "-"}</td>
                  <td className="px-4 py-3">
                    {r.noindex ? <Badge variant="destructive">noindex</Badge> : <Badge variant="default">index</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(r.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <SeoRowActions seo={{
                      id: r.id,
                      page_path: r.page_path,
                      title: r.title || "",
                      description: r.description || "",
                      og_image_url: r.og_image_url || "",
                      noindex: r.noindex,
                    }} />
                  </td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">該当なし</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
