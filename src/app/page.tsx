import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Users, Star, Sparkles, ArrowRight, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
              <Sparkles className="h-4 w-4" />
              ホリスティック心理学 × テクノロジー
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
              あなたに寄り添う
              <br />
              <span className="text-emerald-600">カウンセラー</span>を見つけよう
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              心・体・精神の統合的アプローチで、あなたに最適なカウンセラーをマッチング。
              オンラインで気軽に、本質的な癒しと成長をサポートします。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/counselors">
                <Button size="lg" className="w-full sm:w-auto">
                  カウンセラーを探す
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  詳しく見る
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">選ばれる理由</h2>
            <p className="mt-3 text-gray-500">カウンセラーマッチが提供する3つの価値</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature cards with icons */}
            {[
              { icon: Heart, title: "ホリスティックアプローチ", desc: "身体・心・精神・魂の4層モデルに基づく統合的なカウンセリングで、表面的な問題だけでなく根本的な癒しを提供します。" },
              { icon: Users, title: "AIマッチング", desc: "独自のパーソナリティマトリクス32により、1,024通りのパターンからあなたに最適なカウンセラーを提案します。" },
              { icon: Shield, title: "安心・安全", desc: "全カウンセラーは厳正な審査を通過。SSL暗号化通信とプライバシー保護で、安心してご利用いただけます。" },
            ].map((feature, i) => (
              <Card key={i} className="text-center p-6 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">ご利用の流れ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "無料登録", desc: "メールアドレスまたはSNSアカウントで簡単登録" },
              { step: "02", title: "診断・マッチング", desc: "簡単な質問に答えて、あなたに合うカウンセラーを提案" },
              { step: "03", title: "予約", desc: "カレンダーから都合の良い日時を選んで予約" },
              { step: "04", title: "セッション", desc: "オンラインで安心してカウンセリングを受けられます" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-emerald-200 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            あなたの一歩を、ここから。
          </h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            まずは無料登録から。あなたに合ったカウンセラーとの出会いが、新しい自分への第一歩です。
          </p>
          <Link href="/register">
            <Button size="lg" variant="outline" className="bg-white text-emerald-600 hover:bg-emerald-50 border-white">
              無料で始める
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
