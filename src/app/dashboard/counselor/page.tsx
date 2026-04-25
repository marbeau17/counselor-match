import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Star, TrendingUp } from "lucide-react"
import { formatPrice, formatDate } from "@/lib/utils"

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

export default async function CounselorDashboardPage() {
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: counselor } = await supabase
    .from("counselors")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, client:profiles!bookings_client_id_fkey(*)")
    .eq("counselor_id", counselor?.id)
    .order("scheduled_at", { ascending: false })
    .limit(20)

  const pendingBookings = bookings?.filter(b => b.status === "pending") || []
  const confirmedBookings = bookings?.filter(b => b.status === "confirmed") || []

  const { data: payments } = await supabase
    .from("payments")
    .select("counselor_payout")
    .eq("counselor_id", counselor?.id)
    .eq("status", "paid")

  const totalEarnings = payments?.reduce((sum, p) => sum + p.counselor_payout, 0) || 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          カウンセラーダッシュボード
        </h1>
        <p className="text-gray-500 mt-1">{profile?.display_name || profile?.full_name}先生</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingBookings.length}</p>
              <p className="text-sm text-gray-500">承認待ち</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{confirmedBookings.length}</p>
              <p className="text-sm text-gray-500">予約確定</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counselor?.session_count || 0}</p>
              <p className="text-sm text-gray-500">総セッション</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPrice(totalEarnings)}</p>
              <p className="text-sm text-gray-500">総収益</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending bookings */}
      {pendingBookings.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>承認待ちの予約</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border border-yellow-100 bg-yellow-50">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.client?.display_name || booking.client?.full_name || "クライアント"}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(booking.scheduled_at)} · {booking.duration_minutes}分</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm">承認</Button>
                    <Button size="sm" variant="outline">辞退</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming sessions */}
      <Card>
        <CardHeader>
          <CardTitle>今後のセッション</CardTitle>
        </CardHeader>
        <CardContent>
          {confirmedBookings.length > 0 ? (
            <div className="space-y-4">
              {confirmedBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.client?.display_name || booking.client?.full_name || "クライアント"}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(booking.scheduled_at)} · {booking.duration_minutes}分</p>
                    {booking.notes && <p className="text-sm text-gray-400 mt-1">{booking.notes}</p>}
                  </div>
                  <Badge variant="default">確定</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">予約されているセッションはありません</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
