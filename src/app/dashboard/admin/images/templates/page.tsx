import Link from "next/link"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent } from "@/components/ui/card"
import { TemplatesEditor } from "./editor"

export default async function PromptTemplatesPage() {
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  const { data: templates } = await admin
    .from("prompt_templates")
    .select("*")
    .order("is_favorite", { ascending: false })
    .order("name")

  type Tpl = {
    id: string
    name: string
    category: string | null
    prompt_template: string
    default_aspect_ratio: string
    default_size_preset: string
    variables: { name: string; label: string; default?: string }[]
    is_favorite: boolean
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/admin/images" className="text-sm text-emerald-600 hover:underline">
          ← 画像ライブラリ
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">プロンプトテンプレ</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          再利用するプロンプトを保存。 <code>{"{変数名}"}</code> で展開できます。
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <TemplatesEditor templates={(templates ?? []) as Tpl[]} />
        </CardContent>
      </Card>
    </div>
  )
}
