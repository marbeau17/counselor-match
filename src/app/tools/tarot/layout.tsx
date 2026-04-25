import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "タロット・リフレクション | カードで内省",
  description:
    "タロットのカードを通じて、いま向き合うべきテーマを見つめ直すための無料リフレクション。未来予言ではなく、内省のための問い。",
  alternates: { canonical: "https://counselors.aicreonext.com/tools/tarot" },
  openGraph: {
    title: "タロット・リフレクション | カウンセラーマッチ",
    description: "未来予言ではなく、いまの自分への問いかけとしてのタロット。",
    url: "https://counselors.aicreonext.com/tools/tarot",
  },
}

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return children
}
