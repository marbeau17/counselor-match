import { cn } from "@/lib/utils"
import type { ReviewAxis } from "@/types/database"

const AXIS_LABELS: Record<ReviewAxis, string> = {
  insight: "洞察の鋭さ（的中度）",
  empathy: "共感力",
  practicality: "アドバイスの実用性",
  approachability: "話しやすさ",
  awareness: "新しい気づき",
}

const AXIS_ORDER: ReviewAxis[] = [
  "insight",
  "empathy",
  "practicality",
  "approachability",
  "awareness",
]

export interface ReviewAxesDisplayProps {
  axes: { axis: ReviewAxis; score: number }[]
  size?: "sm" | "lg"
}

export function ReviewAxesDisplay({ axes, size = "lg" }: ReviewAxesDisplayProps) {
  const safeAxes = Array.isArray(axes) ? axes : []
  const scoreMap = new Map<ReviewAxis, number>()
  for (const a of safeAxes) {
    if (a && typeof a.score === "number" && !Number.isNaN(a.score)) {
      scoreMap.set(a.axis, a.score)
    }
  }

  const labelSize = size === "sm" ? "text-xs" : "text-sm"
  const valueSize = size === "sm" ? "text-xs" : "text-sm"
  const barHeight = size === "sm" ? "h-1.5" : "h-2"
  const rowGap = size === "sm" ? "gap-2" : "gap-3"
  const labelWidth = size === "sm" ? "w-36" : "w-44"

  return (
    <div className={cn("space-y-2", size === "sm" && "space-y-1.5")}>
      {AXIS_ORDER.map((axis) => {
        const score = scoreMap.get(axis)
        const hasScore = typeof score === "number"
        const pct = hasScore ? Math.max(0, Math.min(100, (score! / 5) * 100)) : 0
        return (
          <div key={axis} className={cn("flex items-center", rowGap)}>
            <div className={cn("shrink-0 text-gray-600", labelSize, labelWidth)}>
              {AXIS_LABELS[axis]}
            </div>
            <div
              className={cn(
                "relative flex-1 rounded-full overflow-hidden",
                barHeight,
                hasScore
                  ? "bg-gray-100"
                  : "border border-dashed border-gray-200 bg-transparent",
              )}
            >
              {hasScore && (
                <div
                  className={cn("absolute inset-y-0 left-0 bg-emerald-500 rounded-full")}
                  style={{ width: `${pct}%` }}
                />
              )}
            </div>
            <div
              className={cn(
                "shrink-0 w-8 text-right tabular-nums",
                valueSize,
                hasScore ? "text-gray-700" : "text-gray-300",
              )}
            >
              {hasScore ? score!.toFixed(1) : "—"}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ReviewAxesDisplay
