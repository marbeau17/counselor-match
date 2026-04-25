import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GROWTH_STAGES,
  computeStage,
  nextStage,
  stageBySlug,
} from "@/lib/growth-stages"

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

const REQUIREMENT_LABELS: Record<string, string> = {
  sessions: "セッション",
  journals: "ジャーナル",
  reviews: "レビュー",
  distinct_counselors: "異なるカウンセラー",
}

async function fetchStats(userId: string) {
  const zero = { sessions: 0, journals: 0, reviews: 0, distinct_counselors: 0 }
  if (!isSupabaseConfigured()) return zero
  try {
    const supabase = await createClient()
    if (!supabase) return zero

    const [{ data: completedBookings }, { count: journalCount }, { count: reviewCount }] =
      await Promise.all([
        supabase
          .from("bookings")
          .select("counselor_id")
          .eq("client_id", userId)
          .eq("status", "completed"),
        supabase
          .from("journal_entries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("client_id", userId),
      ])

    const sessions = completedBookings?.length ?? 0
    const distinctCounselors = new Set(
      (completedBookings ?? []).map((b: { counselor_id: string }) => b.counselor_id)
    ).size

    return {
      sessions,
      journals: journalCount ?? 0,
      reviews: reviewCount ?? 0,
      distinct_counselors: distinctCounselors,
    }
  } catch {
    return zero
  }
}

export default async function JourneyPage() {
  let userId = "anon"
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) userId = user.id
      }
    } catch {
      // ignore
    }
  }

  const stats = await fetchStats(userId)
  const currentSlug = computeStage(stats)
  const current = stageBySlug(currentSlug)
  const upcoming = nextStage(currentSlug)

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">わたしの旅路</h1>
        <p className="text-gray-500 mt-1">あなたの歩みとステージを見守ります。</p>
      </div>

      {/* Current stage hero */}
      <Card className="mb-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge>{current.label}</Badge>
            <span className="text-sm text-gray-500">{current.romaji}</span>
          </div>
          <CardTitle className="mt-2 text-2xl">現在のステージ: {current.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{current.description}</p>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">受けられる特典</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {current.perks.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Progress tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {GROWTH_STAGES.map((s, idx) => {
          const currentIdx = GROWTH_STAGES.findIndex((x) => x.slug === currentSlug)
          const isCurrent = s.slug === currentSlug
          const isLocked = idx > currentIdx
          return (
            <Card
              key={s.slug}
              className={
                isCurrent
                  ? "border-emerald-400 ring-2 ring-emerald-200"
                  : isLocked
                  ? "opacity-60"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{s.label}</CardTitle>
                  {isCurrent ? (
                    <Badge>現在</Badge>
                  ) : isLocked ? (
                    <Badge variant="secondary">未到達</Badge>
                  ) : (
                    <Badge variant="outline">達成済み</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">{s.romaji}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>セッション: {s.requirements.sessions}回</li>
                  <li>ジャーナル: {s.requirements.journals}件</li>
                  <li>レビュー: {s.requirements.reviews}件</li>
                  {s.requirements.distinct_counselors !== undefined && (
                    <li>異なるカウンセラー: {s.requirements.distinct_counselors}人</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress bars toward next stage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">
            {upcoming ? `次のステージ: ${upcoming.label} へ` : "最終段階"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming ? (
            <div className="space-y-4">
              {(Object.keys(upcoming.requirements) as Array<keyof typeof upcoming.requirements>).map((key) => {
                const required = upcoming.requirements[key] ?? 0
                if (required === 0) return null
                const currentVal = (stats as Record<string, number>)[key] ?? 0
                const pct = Math.min(100, Math.round((currentVal / required) * 100))
                return (
                  <div key={String(key)}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{REQUIREMENT_LABELS[String(key)] ?? String(key)}</span>
                      <span className="text-gray-500">
                        {currentVal} / {required}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-emerald-700 font-medium">最終段階に到達しました</p>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500 text-center">
        ステージは降格しません。期限もありません。あなたのペースで。
      </p>
    </div>
  )
}
