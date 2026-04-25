import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "パーソナリティ診断 | 32 タイプの性格構造で内省",
  description:
    "32 タイプの性格構造から、今の自分の在り方をやさしく内省するための無料診断。占いではなく、内省のための問いかけです。",
  alternates: { canonical: "https://counselors.aicreonext.com/tools/personality" },
  openGraph: {
    title: "パーソナリティ診断 | カウンセラーマッチ",
    description: "32 タイプの性格構造から、自分を静かに見つめる無料診断。",
    url: "https://counselors.aicreonext.com/tools/personality",
  },
}

export default function PersonalityLayout({ children }: { children: React.ReactNode }) {
  return children
}
