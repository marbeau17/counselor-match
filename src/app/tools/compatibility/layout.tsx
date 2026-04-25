import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "相性診断 | 関係性を構造で観る",
  description:
    "関係性の相互作用を、構造として静かに眺める無料相性診断。ふたりの生年月日からヒントを。",
  alternates: { canonical: "https://counselors.aicreonext.com/tools/compatibility" },
  openGraph: {
    title: "相性診断 | カウンセラーマッチ",
    description: "関係性を構造として観る、静かな無料相性診断。",
    url: "https://counselors.aicreonext.com/tools/compatibility",
  },
}

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children
}
