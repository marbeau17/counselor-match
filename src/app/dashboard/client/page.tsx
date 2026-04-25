import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Search } from "lucide-react"
import { formatPrice, formatDate } from "@/lib/utils"

type BookingRow = {
  id: string
  scheduled_at: string
  duration_minutes: number
  status: keyof typeof statusLabels
  price: number
  counselor?: { profiles?: { display_name?: string; full_name?: string } }
}

const statusLabels: Record<string, string> = {
  pending: "確認待ち",
  confirmed: "確定",
  completed: "完了",
  cancelled: "キャンセル",
}

const statusVariants: Record<string, "default" | "secondary" | "warning" | "destructive"> = {
  pending: "warning",
  confirmed: "default",
  completed: "secondary",
  cancelled: "destructive",
}

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, counselor:counselors(*, profiles(*))")
    .eq("client_id", user.id)
    .order("scheduled_at", { ascending: false })
    .limit(10)

  const upcomingBookings = bookings?.filter(b => b.status === "confirmed" || b.status === "pending") || []
  const pastBookings = bookings?.filter(b => b.status === "completed" || b.status === "cancelled") || []

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          こんにちは、{profile?.display_name || profile?.full_name || "ゲスト"}さん
        </h1>
        <p className="text-gray-500 mt-1">マイページ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingBookings.length}</p>
              <p className="text-sm text-gray-500">予約中</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pastBookings.length}</p>
              <p className="text-sm text-gray-500">セッション履歴</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Search className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <Link href="/counselors">
                <Button variant="link" className="p-0 h-auto text-base font-bold">カウンセラーを探す</Button>
              </Link>
              <p className="text-sm text-gray-500">新しいカウンセラーを見つける</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming bookings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>予約一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking: BookingRow) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.counselor?.profiles?.display_name || booking.counselor?.profiles?.full_name || "カウンセラー"}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(booking.scheduled_at)} · {booking.duration_minutes}分</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariants[booking.status]}>{statusLabels[booking.status]}</Badge>
                    <span className="text-sm font-medium">{formatPrice(booking.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">予約はありません</p>
          )}
        </CardContent>
      </Card>

      {/* Past sessions */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>セッション履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.map((booking: BookingRow) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.counselor?.profiles?.display_name || booking.counselor?.profiles?.full_name || "カウンセラー"}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(booking.scheduled_at)}</p>
                  </div>
                  <Badge variant={statusVariants[booking.status]}>{statusLabels[booking.status]}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
