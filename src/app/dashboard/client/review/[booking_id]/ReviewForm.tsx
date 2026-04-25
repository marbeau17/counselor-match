"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

const AXES = [
  { key: "insight",        label: "洞察",       desc: "本質を見抜く力" },
  { key: "empathy",        label: "共感",       desc: "気持ちに寄り添う力" },
  { key: "practicality",   label: "実用性",     desc: "日常で活かせる助言" },
  { key: "approachability",label: "話しやすさ", desc: "安心して話せる雰囲気" },
  { key: "awareness",      label: "気づき",     desc: "新しい視点の提供" },
] as const

type AxisKey = typeof AXES[number]["key"]

export function ReviewForm({ bookingId, counselorName }: { bookingId: string; counselorName: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isAnon, setIsAnon] = useState(false)
  const [axes, setAxes] = useState<Record<AxisKey, number>>({
    insight: 5, empathy: 5, practicality: 5, approachability: 5, awareness: 5,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          rating,
          comment: comment.trim() || null,
          is_anonymous: isAnon,
          axes: AXES.map((a) => ({ axis: a.key, score: axes[a.key] })),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || `Failed (HTTP ${res.status})`)
      router.push("/dashboard/client?reviewed=1")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "投稿に失敗しました"
      setError(message)
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 総合評価 */}
          <div>
            <Label className="block mb-2">総合評価</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1"
                  aria-label={`${n} 星`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      n <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 5軸評価 */}
          <div>
            <Label className="block mb-3">詳細評価（5軸）</Label>
            <div className="space-y-3">
              {AXES.map((a) => (
                <div key={a.key} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{a.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{a.desc}</p>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={axes[a.key]}
                    onChange={(e) => setAxes({ ...axes, [a.key]: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-sm font-mono text-gray-600 dark:text-gray-300 text-right">{axes[a.key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* コメント */}
          <div>
            <Label htmlFor="comment" className="block mb-2">コメント（任意）</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`${counselorName}先生のセッションで印象に残ったこと、他の方へのおすすめポイント等`}
              rows={5}
            />
          </div>

          {/* 匿名 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnon}
              onChange={(e) => setIsAnon(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">匿名で投稿する</span>
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full" size="lg">
            {busy ? "投稿中..." : "レビューを投稿する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
