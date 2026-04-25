import { fetchPublishedSections, fetchDraftSections } from "@/lib/landing"
import { verifyPreviewToken } from "@/lib/preview-token"
import { SectionRenderer } from "@/components/landing/section-renderer"

export const revalidate = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ _preview?: string }>
}) {
  const sp = await searchParams
  const isPreview = sp._preview ? verifyPreviewToken(sp._preview, "home") !== null : false
  const sections = isPreview
    ? await fetchDraftSections("home")
    : await fetchPublishedSections("home")

  return (
    <>
      {isPreview && (
        <div className="bg-yellow-500 text-yellow-950 px-4 py-2 text-sm text-center font-medium sticky top-0 z-50">
          プレビューモード (下書き内容を表示中)
        </div>
      )}
      <main>
        {sections.map((s) => (
          <SectionRenderer key={s.id} type={s.section_type} props={s.props} />
        ))}
      </main>
    </>
  )
}
