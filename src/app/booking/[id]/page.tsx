"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Video, MessageCircle, Phone, ArrowLeft, Calendar, Clock, CheckCircle } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { mockCounselors } from "@/lib/mock-data"

const sessionTypeIcons: Record<string, typeof Video> = {
  online: Video,
  chat: MessageCircle,
  phone: Phone,
}

const sessionTypeLabels: Record<string, string> = {
  online: "オンライン（ビデオ）",
  chat: "チャット",
  phone: "電話",
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [counselor, setCounselor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form state
  const [sessionType, setSessionType] = useState<string>("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Check auth
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      // Try Supabase first, fallback to mock
      if (currentUser) {
        const { data } = await supabase
          .from("counselors")
          .select("*, profiles(*)")
          .eq("id", id)
          .eq("is_active", true)
          .single()

        if (data) {
          setCounselor(data)
          if (data.available_session_types?.length > 0) {
            setSessionType(data.available_session_types[0])
          }
          setLoading(false)
          return
        }
      }

      // Fallback to mock data
      const mock = mockCounselors.find((c) => c.id === id)
      if (mock) {
        setCounselor(mock)
        if (mock.available_session_types?.length > 0) {
          setSessionType(mock.available_session_types[0])
        }
      }
      setLoading(false)
    }

    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      router.push("/login")
      return
    }

    if (!sessionType || !date || !time) {
      setError("セッション形式、日付、時間をすべて選択してください。")
      return
    }

    setSubmitting(true)

    try {
      const scheduledAt = new Date(`${date}T${time}:00+09:00`).toISOString()

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counselor_id: id,
          session_type: sessionType,
          scheduled_at: scheduledAt,
          duration_minutes: 50,
          notes: notes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "予約の作成に失敗しました。")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "予約の作成に失敗しました。もう一度お試しください。")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!counselor) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">カウンセラーが見つかりません</p>
          <Link href="/counselors" className="mt-4 inline-block">
            <Button variant="outline">カウンセラー一覧へ戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center">
          <CardContent className="py-12 space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">予約が完了しました</h1>
            <p className="text-gray-500">
              {counselor.profiles?.display_name || counselor.profiles?.full_name}先生への予約が確定しました。
            </p>
            <p className="text-sm text-gray-400">
              詳細はダッシュボードからご確認いただけます。
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Link href="/dashboard/client">
                <Button>ダッシュボードへ</Button>
              </Link>
              <Link href="/counselors">
                <Button variant="outline">カウンセラー一覧へ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const name = counselor.profiles?.display_name || counselor.profiles?.full_name || "カウンセラー"

  // Generate available time slots
  const timeSlots = []
  for (let h = 9; h <= 20; h++) {
    timeSlots.push(`${h.toString().padStart(2, "0")}:00`)
    if (h < 20) timeSlots.push(`${h.toString().padStart(2, "0")}:30`)
  }

  // Min date is tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/counselors/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-6">
        <ArrowLeft className="h-4 w-4" />
        カウンセラー詳細に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">予約する</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking form */}
        <div className="lg:col-span-2">
          {!user && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="py-4">
                <p className="text-sm text-amber-800">
                  予約にはログインが必要です。{" "}
                  <Link href="/login" className="text-emerald-600 hover:underline font-medium">
                    ログイン
                  </Link>
                  {" "}または{" "}
                  <Link href="/register" className="text-emerald-600 hover:underline font-medium">
                    新規登録
                  </Link>
                  {" "}してください。
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>セッション詳細</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Session type */}
                <div className="space-y-2">
                  <Label>セッション形式</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {counselor.available_session_types?.map((type: string) => {
                      const Icon = sessionTypeIcons[type] || MessageCircle
                      const isSelected = sessionType === type
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSessionType(type)}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-600"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{sessionTypeLabels[type] || type}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      日付
                    </span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={minDate}
                    required
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <Label htmlFor="time">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      時間
                    </span>
                  </Label>
                  <select
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">時間を選択</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">相談内容・メモ（任意）</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="事前にお伝えしたいことがあればご記入ください"
                    rows={4}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting || !user}
                >
                  {submitting ? "予約処理中..." : "予約を確定する"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Counselor summary sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>予約内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar src={counselor.profiles?.avatar_url} alt={name} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900">{name}</p>
                  {counselor.title && (
                    <p className="text-xs text-gray-500 line-clamp-1">{counselor.title}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">セッション形式</span>
                  <span className="font-medium">{sessionTypeLabels[sessionType] || "未選択"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">日付</span>
                  <span className="font-medium">{date || "未選択"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">時間</span>
                  <span className="font-medium">{time || "未選択"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">セッション時間</span>
                  <span className="font-medium">50分</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="text-gray-500">合計</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatPrice(counselor.hourly_rate)}
                </span>
              </div>

              <p className="text-xs text-gray-400">
                ※ お支払いは予約確定後にご案内いたします
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
