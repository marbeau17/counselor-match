import Link from "next/link"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MessageCircle } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { Counselor, Profile } from "@/types/database"

const levelLabels: Record<string, string> = {
  starter: "スターター",
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
}

export function CounselorCard({ counselor }: CounselorCardProps) {
  const name = counselor.profiles?.display_name || counselor.profiles?.full_name || "カウンセラー"

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={counselor.profiles?.avatar_url}
            alt={name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
              <Badge variant={levelVariants[counselor.level]}>
                {levelLabels[counselor.level]}
              </Badge>
            </div>
            {counselor.title && (
              <p className="text-sm text-gray-500 mt-1">{counselor.title}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-emerald-600">
              {formatPrice(counselor.hourly_rate)}
            </p>
            <p className="text-xs text-gray-400">/ 50分</p>
            <Link href={`/counselors/${counselor.id}`} className="mt-3 block">
              <Button size="sm">詳細を見る</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
