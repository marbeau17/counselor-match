import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Compass,
  Sparkles,
  BookHeart,
  Shield,
  ArrowRight,
  Search,
  UserCheck,
  CalendarCheck,
  NotebookPen,
} from "lucide-react"
import { groupMethodologies } from "@/lib/taxonomy"

export default function HomePage() {
  const groups = groupMethodologies()

  const features = [
    {
      icon: Heart,
      title: "ホリスティック心理学",
      desc: "身体・心・感情・魂の4層から本質に向き合う。",
    },
    {
      icon: Compass,
      title: "Soul Mirror Law",
      desc: "関係性を鏡に、内側の真実を観る独自メソッド。",
    },
    {
      icon: Shield,
      title: "守られた対話",
      desc: "厳選カウンセラー・多軸レビュー・満足保証。",
    },
  ]

  const steps = [
    { icon: Search, title: "悩みとアプローチで探す", desc: "テーマと方法論からあなたに合う伴走者を絞り込みます。" },
    { icon: UserCheck, title: "プロフィール・レビューを確認", desc: "背景・専門・受け手の声を多角的に確かめます。" },
    { icon: CalendarCheck, title: "セッションを予約", desc: "オンライン・チャット・電話から選べます。" },
    { icon: NotebookPen, title: "振り返りジャーナルで統合", desc: "気づきを記録し、日々の内省として根づかせます。" },
  ]

  const tools = [
    {
      href: "/tools/personality",
      icon: BookHeart,
      title: "パーソナリティ診断",
      desc: "32タイプの性格構造から、今の自分の在り方を内省する。",
    },
    {
      href: "/tools/tarot",
      icon: Sparkles,
      title: "タロット・リフレクション",
      desc: "カードを通じて、いま向き合うべきテーマを見つめ直す。",
    },
    {
      href: "/tools/compatibility",
      icon: Heart,
      title: "関係性リフレクション",
      desc: "大切な人との関係を、魂の鏡として静かに観察する。",
    },
  ]

  const familyLabels: Record<"holistic" | "spiritual" | "divination", string> = {
    holistic: "ホリスティック",
    spiritual: "スピリチュアル",
    divination: "占術",
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-gray-950 dark:to-teal-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
              <Sparkles className="h-4 w-4" />
              Holistic × Spiritual Counseling
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
              占いを超えた、
              <br className="sm:hidden" />
              <span className="text-emerald-600">魂のためのホリスティックカウンセリング</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              心理学とスピリチュアルの統合で、本当の自分に還る場所。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/counselors">
                <Button size="lg" className="w-full sm:w-auto">
                  カウンセラーを探す
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/tools/personality">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  無料診断を試す
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              厳選されたカウンセラーによる、4層統合（身体・心・感情・魂）のアプローチ
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="text-center p-6 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Methodologies strip */}
      <section className="py-14 bg-gray-50 border-y border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Our Methodologies</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">3つの知の系譜を、ひとつの対話に統合します。</p>
          </div>
          <div className="space-y-4">
            {(Object.keys(groups) as Array<keyof typeof groups>).map((key) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-32 shrink-0">
                  {familyLabels[key]}
                </span>
                <div className="flex flex-wrap gap-2">
                  {groups[key].map((m) => (
                    <Badge key={m.slug} variant="secondary" className="font-normal">
                      {m.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ご利用の流れ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <s.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-xs text-emerald-600 font-semibold mb-1">STEP {String(i + 1).padStart(2, "0")}</div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free tools */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">無料で試せるリフレクションツール</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">占いではなく、自分自身と対話するためのきっかけを。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((t, i) => (
              <Link key={i} href={t.href} className="block group">
                <Card className="h-full p-6 hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <t.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-emerald-700">
                      {t.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">今すぐ、魂との対話をはじめる</h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            本当の自分に還るための、静かな一歩を。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-white text-emerald-600 hover:bg-emerald-50 border-white w-full sm:w-auto">
                今すぐ、魂との対話をはじめる
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/tools/personality">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-emerald-700 w-full sm:w-auto">
                まずは無料パーソナリティ診断
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
