import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "カウンセラーを探す",
  description:
    "ホリスティック心理学に根ざした、伴走型カウンセラーを悩み・アプローチで絞り込んで探せます。厳選審査済の日本人カウンセラーから、あなたの今に合う一人を。",
  alternates: { canonical: "https://counselors.aicreonext.com/counselors" },
  openGraph: {
    title: "カウンセラーを探す | カウンセラーマッチ",
    description:
      "ホリスティック心理学・スピリチュアルなアプローチを大切にする、厳選カウンセラー一覧。あなたの言葉のリズムに合う伴走者を見つけてください。",
    url: "https://counselors.aicreonext.com/counselors",
  },
}

export default function CounselorsLayout({ children }: { children: React.ReactNode }) {
  return children
}
