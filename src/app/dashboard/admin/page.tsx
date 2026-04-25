import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Calendar, CreditCard } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/dashboard")

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: totalCounselors } = await supabase
    .from("counselors")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, platform_fee")
    .eq("status", "paid")

  const totalRevenue = payments?.reduce((sum, p) => sum + p.platform_fee, 0) || 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="text-gray-500 mt-1">プラットフォーム概要</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalUsers || 0}</p>
                <p className="text-sm text-gray-500">総ユーザー数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalCounselors || 0}</p>
                <p className="text-sm text-gray-500">アクティブカウンセラー</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalBookings || 0}</p>
                <p className="text-sm text-gray-500">総予約数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
                <p className="text-sm text-gray-500">プラットフォーム収益</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>最近の予約</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-center py-8">データがありません</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>新規ユーザー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-center py-8">データがありません</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
