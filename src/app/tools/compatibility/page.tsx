"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Mail } from "lucide-react"

type RelationshipType = "恋人" | "配偶者" | "家族" | "友人" | "同僚" | ""

type Result = {
  score: number
  label: "共鳴" | "調和" | "学び合い"
  interpretation: string
  prompts: string[]
}

function reduceToSingleDigit(dateStr: string): number {
  const digits = dateStr.replace(/\D/g, "")
  let sum = 0
  for (const ch of digits) sum += parseInt(ch, 10)
  while (sum >= 10) {
    let next = 0
    for (const ch of String(sum)) next += parseInt(ch, 10)
    sum = next
  }
  return sum
}

function buildInterpretation(label: Result["label"], rel: RelationshipType): string {
  const relLabel = rel || "お二人"
  if (label === "共鳴") {
    return `${relLabel}の関係には、互いの内側にある静けさが響き合うような共鳴があります。言葉にならない感覚を分かち合いやすく、安心と信頼が自然に育ちやすい関係性です。だからこそ、心地よさに甘えすぎず、小さな違いや変化に丁寧に目を向けていくことが、関係をより深めていく鍵になります。`
  }
  if (label === "調和") {
    return `${relLabel}は、異なるリズムを持ちながらも穏やかに調和していける関係です。相手の個性を尊重する余裕があり、対話を重ねるほどに理解が深まっていきます。ときに立ち止まり、お互いが本当に大切にしたいものを言葉にして確かめ合うことで、関係はさらに豊かになっていくでしょう。`
  }
  return `${relLabel}の関係には、互いの違いから学び合うダイナミクスがあります。価値観や感じ方のズレに戸惑う場面もあるかもしれませんが、それはお互いの魂が新しい視点を必要としているサインでもあります。相手を変えようとするのではなく、自分自身への気づきを深める鏡として関わると、思いがけない成長が訪れます。`
}

function buildPrompts(rel: RelationshipType): string[] {
  const base = [
    "お互いが最も安心する瞬間はいつですか？",
    "相手から学んでいると感じることは何ですか？",
    "今の関係で、もう少し大切にしたい時間はありますか？",
  ]
  if (rel === "恋人" || rel === "配偶者") {
    return [
      "お互いが最も安心する瞬間はいつですか？",
      "相手に伝えられていない感謝はありますか？",
      "二人で育てていきたい小さな習慣はありますか？",
    ]
  }
  if (rel === "家族") {
    return [
      "家族として、お互いに助けられていると感じるのはどんなときですか？",
      "言葉にできずにきた思いはありますか？",
      "これから一緒に過ごしたい時間はどんな時間ですか？",
    ]
  }
  if (rel === "友人") {
    return [
      "この友情の中で、自分らしくいられる瞬間はいつですか？",
      "相手のどんな姿に尊敬を感じますか？",
      "お互いに続けていきたい関わり方はありますか？",
    ]
  }
  if (rel === "同僚") {
    return [
      "一緒に働く中で、安心して話せるテーマは何ですか？",
      "相手の強みから学べることは何ですか？",
      "より良く協力するために工夫できることはありますか？",
    ]
  }
  return base
}

export default function CompatibilityPage() {
  const [yourDOB, setYourDOB] = useState("")
  const [theirDOB, setTheirDOB] = useState("")
  const [relationship, setRelationship] = useState<RelationshipType>("")
  const [result, setResult] = useState<Result | null>(null)

  const canSubmit = useMemo(() => Boolean(yourDOB && theirDOB), [yourDOB, theirDOB])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const a = reduceToSingleDigit(yourDOB)
    const b = reduceToSingleDigit(theirDOB)
    const raw = 100 - Math.abs(a - b) * 10
    const score = Math.max(50, Math.min(100, raw))
    const label: Result["label"] = score >= 90 ? "共鳴" : score >= 70 ? "調和" : "学び合い"
    setResult({
      score,
      label,
      interpretation: buildInterpretation(label, relationship),
      prompts: buildPrompts(relationship),
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">相性診断</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 dark:text-gray-600">生年月日から見る、二人の魂のダイナミクス。</p>
      </div>

      <Card className="mb-6 bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <p className="text-sm text-amber-900 leading-relaxed">
            相性診断は関係を楽しむきっかけです。運命を決めるものではありません。
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="yourDOB" className="mb-2 block">あなたの生年月日</Label>
              <Input
                id="yourDOB"
                type="date"
                required
                value={yourDOB}
                onChange={(e) => setYourDOB(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="theirDOB" className="mb-2 block">お相手の生年月日</Label>
              <Input
                id="theirDOB"
                type="date"
                required
                value={theirDOB}
                onChange={(e) => setTheirDOB(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="rel" className="mb-2 block">関係性（任意）</Label>
              <select
                id="rel"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">選択しない</option>
                <option value="恋人">恋人</option>
                <option value="配偶者">配偶者</option>
                <option value="家族">家族</option>
                <option value="友人">友人</option>
                <option value="同僚">同僚</option>
              </select>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
              診断する
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-2">相性スコア</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-bold text-emerald-700">{result.score}</span>
                  <span className="text-xl text-gray-500 dark:text-gray-400 dark:text-gray-500">/ 100</span>
                </div>
                <div className="mt-3 inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-4 py-1 text-sm font-medium">
                  {result.label}
                </div>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-6">
                {result.interpretation}
              </p>

              <div className="border-t border-emerald-200 pt-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  二人で見つめ合うための問いかけ
                </h3>
                <ul className="space-y-2">
                  {result.prompts.map((p, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed pl-4 border-l-2 border-emerald-300">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 dark:text-gray-600 mb-4 leading-relaxed">
                診断結果は出発点です。関係性の奥にある感情や願いを、専門のカウンセラーと一緒に見つめてみませんか。
              </p>
              <Link href="/counselors?concern=family">
                <Button size="lg">
                  関係性を深く見つめるカウンセリングへ
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
            <CardContent className="p-6 text-center">
              <Mail className="h-6 w-6 text-gray-500 dark:text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                詳細レポートをメールで受け取る（無料）
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">
                お二人の関係をより深く紐解くレポートをお届けします。
              </p>
              <Link href="/register">
                <Button variant="outline">
                  無料登録してレポートを受け取る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
