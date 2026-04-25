import Link from "next/link"
import { ColumnEditor } from "../editor"

export default function NewColumnPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/admin/columns" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← コラム一覧
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">新規コラム</h1>
      </div>
      <ColumnEditor mode="create" />
    </div>
  )
}
