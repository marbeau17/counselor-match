import Link from "next/link"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { ImageGrid } from "./grid"

export default async function AdminImagesPage() {
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  const [imagesResp, templatesResp] = await Promise.all([
    admin.from("generated_images").select("*").order("created_at", { ascending: false }).limit(100),
    admin.from("prompt_templates").select("id, name, category, prompt_template, default_aspect_ratio, default_size_preset, variables, is_favorite").order("is_favorite", { ascending: false }).order("name"),
  ])

  type Image = {
    id: string
    prompt: string
    aspect_ratio: string
    size_preset: string
    public_url: string
    storage_path: string
    status: string
    error_message: string | null
    tags: string[]
    created_at: string
  }
  type Template = {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">画像ライブラリ</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{imagesResp.data?.length ?? 0} 枚 / Gemini Banana Pro</p>
        </div>
        <Link href="/dashboard/admin/images/templates">
          <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />プロンプトテンプレ管理</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <ImageGrid
            images={(imagesResp.data ?? []) as Image[]}
            templates={(templatesResp.data ?? []) as Template[]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
