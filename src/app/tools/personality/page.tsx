"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type ArchetypeKey = "seeker" | "healer" | "creator"

type Archetype = {
  key: ArchetypeKey
  label: string
  jp: string
  tagline: string
  description: string
  strengths: string[]
  shadows: string[]
  prompts: string[]
}

const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  seeker: {
    key: "seeker",
    label: "Seeker",
    jp: "探求者",
    tagline: "真理と意味を求めて問い続ける魂のタイプ",
    description:
      "あなたは、目に見えるものの奥にある本質へと意識を向ける人です。安易な答えに満足せず、自分自身と世界に誠実な問いを重ねることで、静かに深みを育んでいきます。",
    strengths: [
      "物事の本質を見抜く洞察力",
      "独立した思考と自分なりの視点",
      "学びと内省を続ける粘り強さ",
    ],
    shadows: [
      "考えすぎて行動が遅れ、孤立を感じやすい",
      "「まだ十分ではない」と自分に厳しくなりがち",
    ],
    prompts: [
      "いま自分が本当に知りたい問いは何ですか？",
      "答えを急がず、問いと共に在ることを自分に許せていますか？",
    ],
  },
  healer: {
    key: "healer",
    label: "Healer",
    jp: "癒し手",
    tagline: "他者と自分を結び、調和を育む魂のタイプ",
    description:
      "あなたは、人と人、感情と感情のあいだに橋を架ける人です。場の空気や相手の痛みを繊細に感じ取り、その存在そのものが周囲に静かな安心を広げていきます。",
    strengths: [
      "深い共感力と聴く力",
      "対立を和らげ、関係を整える調停力",
      "相手の尊厳を大切にする優しさ",
    ],
    shadows: [
      "他者の感情を抱え込み、自分を後回しにしやすい",
      "「No」と言えず、境界線が曖昧になりがち",
    ],
    prompts: [
      "いま自分自身に向けたい、やさしい言葉は何ですか？",
      "守りたい境界線はどこにありますか？",
    ],
  },
  creator: {
    key: "creator",
    label: "Creator",
    jp: "創造者",
    tagline: "表現を通じて世界に光をもたらす魂のタイプ",
    description:
      "あなたは、内側にあるイメージや感情を、言葉・形・行動として外に届ける人です。あなたの表現は、誰かの心にそっと火を灯し、その人自身の創造性を呼び起こしていきます。",
    strengths: [
      "豊かな想像力と表現力",
      "新しい可能性を見出す発想の柔軟さ",
      "人の心を動かす率直さと熱量",
    ],
    shadows: [
      "気分や感情の波に振り回されやすい",
      "評価を気にしすぎて、表現が止まることがある",
    ],
    prompts: [
      "評価から自由になれたら、いま何を創りたいですか？",
      "あなたの表現は、どんな人にそっと届いてほしいですか？",
    ],
  },
}

function reduceDigits(n: number): number {
  let x = Math.abs(n)
  while (x >= 10) {
    let s = 0
    while (x > 0) {
      s += x % 10
      x = Math.floor(x / 10)
    }
    x = s
  }
  return x
}

function computeArchetype(birthdate: string): Archetype {
  const digits = birthdate.replace(/\D/g, "")
  let sum = 0
  for (const ch of digits) sum += Number(ch)
  const reduced = reduceDigits(sum)
  if (reduced === 1 || reduced === 4 || reduced === 7) return ARCHETYPES.seeker
  if (reduced === 2 || reduced === 5 || reduced === 8) return ARCHETYPES.healer
  if (reduced === 3 || reduced === 6 || reduced === 9) return ARCHETYPES.creator
  return ARCHETYPES.seeker
}

export default function PersonalityToolPage() {
  const [name, setName] = React.useState("")
  const [birthdate, setBirthdate] = React.useState("")
  const [result, setResult] = React.useState<Archetype | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!birthdate) return
    setResult(computeArchetype(birthdate))
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleReset = () => {
    setResult(null)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          本格パーソナリティ診断
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300 dark:text-gray-600">
          生年月日から読み解く、4つのコア・アーキタイプ。自己理解のはじまりに。
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
          これは自己理解のきっかけです。未来を予言するものではありません。
        </p>
      </header>

      {!result && (
        <Card>
          <CardHeader>
            <CardTitle>あなたについて教えてください</CardTitle>
            <CardDescription>
              入力された情報は、診断の表示にのみ使用されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">お名前（任意）</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="例：たなかさん"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">生年月日（必須）</Label>
                <Input
                  id="birthdate"
                  type="date"
                  required
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                診断する
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardDescription>
              {name ? `${name} さんのアーキタイプ` : "あなたのアーキタイプ"}
            </CardDescription>
            <CardTitle className="text-2xl">
              {result.label}（{result.jp}）
            </CardTitle>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 dark:text-gray-600">{result.tagline}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="leading-relaxed text-gray-800 dark:text-gray-200">{result.description}</p>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">強み</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
                {result.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                向き合いたい影の側面
              </h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
                {result.shadows.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                内省のための問い
              </h2>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                {result.prompts.map((p) => (
                  <li key={p} className="rounded-md bg-emerald-50 px-3 py-2">
                    {p}
                  </li>
                ))}
              </ul>
            </section>

            <Separator />

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                さらに深く知りたい方へ
              </h2>
              <Link href="/counselors?methodology=personality_matrix_32">
                <Button className="w-full" size="lg">
                  Personality Matrix 32 認定カウンセラーを探す
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  結果を保存して、他の無料ツールも試す
                </Button>
              </Link>
            </section>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              もう一度診断する
            </Button>
          </CardFooter>
        </Card>
      )}
    </main>
  )
}
