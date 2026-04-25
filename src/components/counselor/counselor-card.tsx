import Link from "next/link"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle } from "lucide-react"
import { formatPrice, cn } from "@/lib/utils"
import { concernBySlug } from "@/lib/taxonomy"
import type { Counselor, Profile, AvailabilityMode } from "@/types/database"

const levelLabels: Record<string, string> = {
  starter: "新人",
  regular: "レギュラー",
  senior: "シニア",
  master: "マスター",
}

const levelVariants: Record<string, "default" | "secondary" | "warning" | "destructive"> = {
  starter: "secondary",
  regular: "default",
  senior: "warning",
  master: "destructive",
}

interface CounselorCardProps {
  counselor: Counselor & { profiles?: Profile }
  /** above-the-fold（最初の数枚）は priority=true で画像を eager load */
  priority?: boolean
}

function AvailabilityBadge({ mode }: { mode?: AvailabilityMode }) {
  if (!mode) return null

  if (mode === "machiuke") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        待機中
      </span>
    )
  }

  if (mode === "accepting_bookings") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500 bg-white dark:bg-gray-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        予約受付中
      </span>
    )
  }

  if (mode === "offline") {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500">
        オフライン
      </span>
    )
  }

  return null
}

export function CounselorCard({ counselor, priority = false }: CounselorCardProps) {
  const name = counselor.profiles?.display_name || counselor.profiles?.full_name || "カウンセラー"
  const showPerMinute = counselor.on_demand_enabled === true && counselor.price_per_minute
  const concernSlugs = (counselor.concerns || []).slice(0, 3)

  return (
    <Card className={cn("hover:shadow-md transition-shadow relative")}>
      <div className="absolute top-3 right-3 z-10">
        <AvailabilityBadge mode={counselor.availability_mode} />
      </div>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={counselor.profiles?.avatar_url}
            alt={name}
            size="lg"
            priority={priority}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</h3>
              <Badge variant={levelVariants[counselor.level]}>
                {levelLabels[counselor.level]}
              </Badge>
            </div>
            {counselor.title && (
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">{counselor.title}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {counselor.rating_count > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  {counselor.rating_average.toFixed(1)} ({counselor.rating_count})
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {counselor.session_count}回
              </span>
            </div>
            {counselor.specialties && counselor.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {counselor.specialties.slice(0, 4).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            {concernSlugs.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {concernSlugs.map((slug) => {
                  const concern = concernBySlug(slug)
                  if (!concern) return null
                  return (
                    <Badge key={slug} variant="outline" className="text-xs border-gray-200 dark:border-gray-700">
                      {concern.label}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            {showPerMinute ? (
              <>
                <p className="text-lg font-bold text-emerald-600">
                  ¥{counselor.price_per_minute}
                  <span className="text-sm font-semibold">/分</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">+ 予約可</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-emerald-600">
                  {formatPrice(counselor.hourly_rate)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">/ 50分</p>
              </>
            )}
            <Link href={`/counselors/${counselor.id}`} className="mt-3 block">
              <Button size="sm">詳細を見る</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
