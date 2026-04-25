import Link from "next/link"
import { notFound } from "next/navigation"
import { getAdminClient } from "@/lib/admin"
import { ColumnEditor } from "../editor"

export default async function EditColumnPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  const { data: column } = await admin
    .from("columns")
    .select("*")
    .eq("id", id)
    .single()
  if (!column) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/admin/columns" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← コラム一覧
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">コラム編集</h1>
      </div>
      <ColumnEditor
        mode="edit"
        column={{
          id: column.id,
          slug: column.slug,
          title: column.title,
          body: column.body || "",
          excerpt: column.excerpt || "",
          category: column.category || "",
          published_at: column.published_at,
        }}
      />
    </div>
  )
}
