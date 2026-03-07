import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Layers, Sparkles, Users, BookOpen, ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "私たちについて | カウンセラーマッチ",
  description: "カウンセラーマッチは、ホリスティック心理学に基づくオンラインカウンセリングマッチングプラットフォームです。",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">私たちについて</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          カウンセラーマッチは、合同会社AICREO NEXTが運営するホリスティック心理学に基づくオンラインカウンセリングマッチングプラットフォームです。
        </p>
      </div>

      {/* Methodology */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">ホリスティック心理学</h2>
          <p className="text-gray-500">4層モデルによる統合的アプローチ</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { layer: "Body（身体）", desc: "身体感覚やソマティックな反応を通じた気づきと癒し", color: "bg-green-100 text-green-700" },
            { layer: "Mind（思考）", desc: "認知パターンの理解と思考の再構築", color: "bg-blue-100 text-blue-700" },
            { layer: "Heart（感情）", desc: "感情の受容と内なる感覚への深い繋がり", color: "bg-pink-100 text-pink-700" },
            { layer: "Spirit（魂）", desc: "魂の目的と人生の本質的な意味への探求", color: "bg-purple-100 text-purple-700" },
          ].map((item, i) => (
            <Card key={i} className="text-center">
              <CardContent className="p-6">
                <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium mb-3 ${item.color}`}>
                  {item.layer}
                </div>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Soul Mirror */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">魂鏡の法則</h2>
          <p className="text-gray-600 leading-relaxed">
            「魂鏡の法則」は、創業者 小林由起子が提唱する独自のメソッドです。
            外側の現実は内側の魂の状態を映し出す鏡であるという考えに基づき、
            クライアントが自身の内面と向き合い、本質的な変容を遂げることをサポートします。
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">プラットフォームの特徴</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Layers, title: "パーソナリティマトリクス32", desc: "32タイプ × 32パターン = 1,024通りの組み合わせから、あなたに最適なカウンセラーをAIがマッチングします。" },
            { icon: BookOpen, title: "4段階認定制度", desc: "スターター → レギュラー → シニア → マスターの4段階。厳正な審査と継続的な研修で品質を保証します。" },
            { icon: Users, title: "安心のサポート体制", desc: "24時間対応の緊急サポート、SSL暗号化通信、プライバシー保護。安心してご利用いただけます。" },
          ].map((item, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <item.icon className="h-8 w-8 text-emerald-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Company */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">運営会社</h2>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <dl className="space-y-4">
              {[
                ["会社名", "合同会社AICREO NEXT"],
                ["代表", "小林由起子"],
                ["所在地", "東京都"],
                ["事業内容", "オンラインカウンセリングプラットフォームの運営、ホリスティック心理学に基づく教育・研修事業"],
                ["ウェブサイト", "aicreonext.com"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 sm:w-32 shrink-0">{label}</dt>
                  <dd className="text-sm text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">あなたの旅路を始めましょう</h2>
        <p className="text-gray-500 mb-6">まずはカウンセラーを探してみてください</p>
        <Link href="/counselors">
          <Button size="lg">
            カウンセラーを探す
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
