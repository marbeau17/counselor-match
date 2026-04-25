import Link from "next/link"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

interface SearchParams {
  session_id?: string
  booking_id?: string
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { booking_id } = await searchParams

  // 認証必須（決済直後の戻り）
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 予約情報取得 (RLS により自分の予約のみ取得可)
  let counselorName: string | null = null
  let scheduledAt: string | null = null
  if (booking_id) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("scheduled_at, counselor:counselors(profiles(display_name, full_name))")
      .eq("id", booking_id)
      .single()
    if (booking) {
      type Counselor = { profiles?: { display_name?: string; full_name?: string } }
      const c = (Array.isArray(booking.counselor) ? booking.counselor[0] : booking.counselor) as Counselor | undefined
      counselorName = c?.profiles?.display_name || c?.profiles?.full_name || null
      scheduledAt = booking.scheduled_at
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <Card>
        <CardContent className="py-12 text-center space-y-5">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">決済が完了しました</h1>
          {counselorName && (
            <p className="text-gray-600 dark:text-gray-300">
              {counselorName}先生とのセッション予約が確定しました。
            </p>
          )}
          {scheduledAt && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              予約日時: {new Date(scheduledAt).toLocaleString("ja-JP")}
            </p>
          )}
          <p className="text-sm text-gray-400 dark:text-gray-500">
            セッション開始時刻になりましたら、ダッシュボードから「セッション参加」をクリックしてください。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/dashboard/client">
              <Button>ダッシュボードへ</Button>
            </Link>
            <Link href="/counselors">
              <Button variant="outline">他のカウンセラーを探す</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
