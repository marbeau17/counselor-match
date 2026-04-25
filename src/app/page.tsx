import type { Metadata } from "next"
import { fetchPublishedSections, fetchDraftSections } from "@/lib/landing"
import { verifyPreviewToken } from "@/lib/preview-token"
import { SectionRenderer } from "@/components/landing/section-renderer"

export const revalidate = 60

export const metadata: Metadata = {
  title: "心と関係を整える、伴走型のスピリチュアル・カウンセリング",
  description:
    "急かされない場所で、誰かに、ゆっくり聞いてほしい。ホリスティック心理学に根ざした伴走型のオンラインカウンセリング。厳選カウンセラーと、対話を通じた静かな自己理解を。",
  alternates: { canonical: "https://counselors.aicreonext.com/" },
  openGraph: {
    type: "website",
    title: "心と関係を整える、伴走型のスピリチュアル・カウンセリング",
    description:
      "急かされない場所で、ゆっくり聴いてくれる人と出会う。日本語で受けられる、ホリスティック心理学のオンラインカウンセリング。",
    url: "https://counselors.aicreonext.com/",
  },
}

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
