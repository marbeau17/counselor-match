import { getAdminClient } from "@/lib/admin"
import { LandingEditor } from "./editor"

export default async function AdminLandingPage() {
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  const { data: sections } = await admin
    .from("landing_sections")
    .select("id, page_key, section_type, sort_order, is_visible, draft_props, published_props, has_unpublished_changes, variant_key, variant_weight")
    .eq("page_key", "home")
    .order("sort_order", { ascending: true })

  const { data: history } = await admin
    .from("landing_publish_history")
    .select("id, note, published_at, published_by:profiles!landing_publish_history_published_by_fkey(display_name, email)")
    .eq("page_key", "home")
    .order("published_at", { ascending: false })
    .limit(20)

  type Section = {
    id: string
    page_key: string
    section_type: string
    sort_order: number
    is_visible: boolean
    draft_props: Record<string, unknown>
    published_props: Record<string, unknown> | null
    has_unpublished_changes: boolean
    variant_key: string | null
    variant_weight: number
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ランディング編集</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          セクションを並び替え / 編集 / 公開できます。
        </p>
      </div>

      <LandingEditor
        initialSections={(sections ?? []) as Section[]}
        history={(history ?? []) as Array<{ id: string; note: string | null; published_at: string; published_by: { display_name?: string; email?: string } | { display_name?: string; email?: string }[] | null }>}
      />
    </div>
  )
}
