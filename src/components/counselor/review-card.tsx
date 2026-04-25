import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { ReviewAxesDisplay } from "@/components/counselor/review-axes-display"
import type { Review, ReviewAxisScore, CounselorReply } from "@/types/database"

export interface ReviewCardProps {
  review: Review & {
    axes?: ReviewAxisScore[]
    reply?: CounselorReply | null
    reviewer_name?: string
  }
}

function formatRelative(input: string | Date): string {
  try {
    const d = typeof input === "string" ? new Date(input) : input
    const diffMs = Date.now() - d.getTime()
    const sec = Math.floor(diffMs / 1000)
    if (sec < 60) return "たった今"
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}分前`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}時間前`
    const day = Math.floor(hr / 24)
    if (day < 7) return `${day}日前`
    const wk = Math.floor(day / 7)
    if (wk < 5) return `${wk}週間前`
    const mo = Math.floor(day / 30)
    if (mo < 12) return `${mo}ヶ月前`
    const yr = Math.floor(day / 365)
    return `${yr}年前`
  } catch {
    return ""
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const reviewerLabel = review.is_anonymous
    ? "匿名さん"
    : review.reviewer_name || "ユーザー"

  const axes = Array.isArray(review.axes) ? review.axes : []
  const rel = formatRelative(review.created_at)

  return (
    <article className="rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-3">
      <header className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          実相談者レビュー
        </span>
        <span className="text-sm text-gray-700 dark:text-gray-200">{reviewerLabel}</span>
        {rel && (
          <span className="text-xs text-gray-400 dark:text-gray-500" title={formatDate(review.created_at)}>
            {rel}
          </span>
        )}
      </header>

      {review.comment && (
        <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
          {review.comment}
        </p>
      )}

      <ReviewAxesDisplay axes={axes} size="sm" />

      {review.reply && (
        <div
          className={cn(
            "ml-4 mt-2 border-l-2 border-emerald-200 bg-emerald-50/40 rounded-r-md p-3 space-y-1.5",
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-700">
              カウンセラーより
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatRelative(review.reply.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {review.reply.body}
          </p>
        </div>
      )}
    </article>
  )
}

export default ReviewCard
