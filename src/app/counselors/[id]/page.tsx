import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Star, MessageCircle, Video, Phone, CheckCircle } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

const levelLabels: Record<string, string> = {
  starter: "スターター",
  regular: "レギュラー",
  senior: "シニア",
  master: "マスター",
}

const sessionTypeIcons: Record<string, typeof Video> = {
  online: Video,
  chat: MessageCircle,
  phone: Phone,
}

const sessionTypeLabels: Record<string, string> = {
  online: "ビデオ",
  chat: "チャット",
  phone: "電話",
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("counselors")
    .select("*, profiles(*)")
    .eq("id", id)
    .single()

  const name = data?.profiles?.display_name || data?.profiles?.full_name || "カウンセラー"
  return {
    title: `${name} | カウンセラーマッチ`,
    description: data?.bio?.slice(0, 160) || "",
  }
}

export default async function CounselorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: counselor } = await supabase
    .from("counselors")
    .select("*, profiles(*)")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!counselor) notFound()

  const name = counselor.profiles?.display_name || counselor.profiles?.full_name || "カウンセラー"

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, client:profiles!reviews_client_id_fkey(display_name, full_name)")
    .eq("counselor_id", id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar src={counselor.profiles?.avatar_url} alt={name} size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                    <Badge>{levelLabels[counselor.level]}</Badge>
                  </div>
                  {counselor.title && (
                    <p className="text-gray-500 mt-1">{counselor.title}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    {counselor.rating_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        {counselor.rating_average.toFixed(1)} ({counselor.rating_count}件)
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      セッション {counselor.session_count}回
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>自己紹介</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{counselor.bio}</p>
            </CardContent>
          </Card>

          {/* Specialties */}
          {counselor.specialties?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>専門分野</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {counselor.specialties.map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {counselor.certifications?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>資格・認定</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {counselor.certifications.map((c: string) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>レビュー</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">
                        {review.is_anonymous ? "匿名" : review.client?.display_name || review.client?.full_name || "利用者"}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    )}
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - booking */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle>予約する</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-emerald-600">{formatPrice(counselor.hourly_rate)}</p>
                  <p className="text-sm text-gray-400">/ 50分セッション</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">対応形式</p>
                  <div className="flex flex-wrap gap-2">
                    {counselor.available_session_types?.map((type: string) => {
                      const Icon = sessionTypeIcons[type] || MessageCircle
                      return (
                        <Badge key={type} variant="outline" className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {sessionTypeLabels[type] || type}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
                <Separator />
                <Link href={`/booking/${counselor.id}`}>
                  <Button className="w-full" size="lg">予約に進む</Button>
                </Link>
                <p className="text-xs text-gray-400 text-center">
                  ※ 予約にはログインが必要です
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
