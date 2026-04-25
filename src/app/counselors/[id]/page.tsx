import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Star, MessageCircle, Video, Phone, CheckCircle, Zap } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { mockCounselors, mockReviews } from "@/lib/mock-data"
import { ReviewCard } from "@/components/counselor/review-card"
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

function findMockCounselor(id: string) {
  return mockCounselors.find((c) => c.id === id) || null
}

function findMockReviews(counselorId: string) {
  return mockReviews.filter((r) => r.counselor_id === counselorId)
}

import type { Counselor, Profile, Review } from "@/types/database"

type CounselorRow = Counselor & { profiles?: Profile }
type ReviewRow = Review & {
  client?: { display_name?: string; full_name?: string } | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  let data: CounselorRow | null = null

  try {
    const supabase = await createClient()
    if (supabase) {
      const { data: d } = await supabase
        .from("counselors")
        .select("*, profiles(*)")
        .eq("id", id)
        .single()
      data = d
    }
  } catch {}

  if (!data) data = findMockCounselor(id)

  const name = data?.profiles?.display_name || data?.profiles?.full_name || "カウンセラー"
  return {
    title: `${name} | カウンセラーマッチ`,
    description: data?.bio?.slice(0, 160) || "",
  }
}

export default async function CounselorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let counselor: CounselorRow | null = null
  let reviews: ReviewRow[] | null = null

  try {
    const supabase = await createClient()
    if (supabase) {
      const { data } = await supabase
        .from("counselors")
        .select("*, profiles(*)")
        .eq("id", id)
        .eq("is_active", true)
        .single()
      counselor = data

      if (counselor) {
        const { data: revData } = await supabase
          .from("reviews")
          .select("*, client:profiles!reviews_client_id_fkey(display_name, full_name)")
          .eq("counselor_id", id)
          .order("created_at", { ascending: false })
          .limit(10)
        reviews = revData
      }
    }
  } catch {}

  if (!counselor) {
    counselor = findMockCounselor(id)
    if (counselor) reviews = findMockReviews(id)
  }

  if (!counselor) notFound()

  const name = counselor.profiles?.display_name || counselor.profiles?.full_name || "カウンセラー"

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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{name}</h1>
                    <Badge>{levelLabels[counselor.level]}</Badge>
                  </div>
                  {counselor.title && (
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">{counselor.title}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
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
              <p className="text-gray-600 dark:text-gray-300 dark:text-gray-600 whitespace-pre-wrap leading-relaxed">{counselor.bio}</p>
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
                    <li key={c} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 dark:text-gray-600">
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
                {reviews.map((review) => (
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
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        {review.is_anonymous ? "匿名" : review.client?.display_name || review.client?.full_name || "利用者"}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 dark:text-gray-600">{review.comment}</p>
                    )}
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 相談者の声 - Axes-enhanced review cards */}
          {reviews && reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>相談者の声</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                  当たる、の先へ。洞察・共感・実用性・話しやすさ・気づきの5軸で可視化しています。
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={`axes-${review.id}`}
                    review={{
                      ...review,
                      axes: review.axes ?? [],
                      reply: review.reply ?? null,
                      reviewer_name:
                        review.client?.display_name ||
                        review.client?.full_name ||
                        undefined,
                    }}
                  />
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
                  <p className="text-sm text-gray-400 dark:text-gray-500">/ 50分セッション</p>
                </div>
                {counselor.price_per_minute && counselor.on_demand_enabled && (
                  <div className="rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <p className="text-sm font-semibold text-emerald-700">
                      ¥{counselor.price_per_minute}/分{" "}
                      <span className="text-xs font-normal text-emerald-600">(待機中価格)</span>
                    </p>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">対応形式</p>
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
                {counselor.availability_mode === "machiuke" && (
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                      <Zap className="h-3 w-3" />
                      今すぐ通話可能
                    </span>
                  </div>
                )}
                <Link href={`/booking/${counselor.id}`}>
                  <Button className="w-full" size="lg">予約に進む</Button>
                </Link>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
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
