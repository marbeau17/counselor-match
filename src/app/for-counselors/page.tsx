import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ShieldCheck, TrendingUp, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "カウンセラー登録のご案内 | カウンセラーマッチ",
  description: "カウンセラーマッチでセッションを提供する方向けの応募ご案内です。",
}

const BENEFITS = [
  { icon: Users,        title: "良質なクライアント",    desc: "目的意識の高い相談者と出会えるマッチング体験を提供します。" },
  { icon: TrendingUp,   title: "段階的な成長機会",      desc: "新人 → レギュラー → シニア → マスターの 4 階層で実績を可視化。" },
  { icon: ShieldCheck,  title: "安全な対話環境",        desc: "通報機能・倫理規定・賠償責任保険でクライアントとカウンセラーを守ります。" },
  { icon: CheckCircle,  title: "透明な手数料",          desc: "プラットフォーム手数料は20%。カウンセラー報酬は明確です。" },
]

const REQUIREMENTS = [
  "心理カウンセリング・スピリチュアルケア・占術等いずれかの実務 6 ヶ月以上",
  "安定したインターネット環境（オンラインセッション可能）",
  "倫理ステートメントへの署名",
  "30 分の録画ビデオ面接",
  "オーディションセッションへの参加",
  "専門家 1 名のリファレンス",
]

export default function ForCounselorsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <section className="text-center mb-12">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">For Counselors</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          カウンセラーとして登録する
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          ホリスティック心理学とスピリチュアルケアを統合した対話を、安心して届けられる場所。
          私たちと一緒に、相談者の魂の旅路を伴走しませんか。
        </p>
      </section>

      {/* Benefits */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          私たちが提供できること
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENEFITS.map((b) => (
            <Card key={b.title}>
              <CardContent className="p-6 flex items-start gap-4">
                <b.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{b.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{b.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          応募の前提条件
        </h2>
        <Card>
          <CardContent className="p-6">
            <ul className="space-y-3">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
              詳細は <Link href="/about/screening" className="text-emerald-600 dark:text-emerald-400 hover:underline">選考プロセス</Link> をご覧ください。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Apply */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">応募について</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
          現在は招待制で運営しております。応募ご希望の方は、下記メールアドレスまで自己紹介・実務経歴をお送りください。担当者より追ってご連絡いたします。
        </p>
        <a href="mailto:counselors@aicreonext.example.com">
          <Button size="lg">メールで応募する</Button>
        </a>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          counselors@aicreonext.example.com
        </p>
      </section>
    </div>
  )
}
