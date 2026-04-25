import Link from "next/link"
import { notFound } from "next/navigation"
import { getAdminClient } from "@/lib/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { BookingActions } from "./actions"

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = getAdminClient()
  if (!admin) return <p>Service role not configured</p>

  type Cli = { id?: string; full_name?: string; display_name?: string; email?: string }
  type CounselorWithProfile = { id?: string; profiles?: Cli | Cli[] | null }
  type BookingDetail = {
    id: string
    status: string
    scheduled_at: string
    duration_minutes: number
    price: number
    session_type: string
    notes: string | null
    meeting_url: string | null
    created_at: string
    client: Cli | Cli[] | null
    counselor: CounselorWithProfile | CounselorWithProfile[] | null
  }
  type PaymentRow = {
    id: string
    status: string
    amount: number
    platform_fee: number
    counselor_payout: number
    stripe_payment_intent_id: string | null
    created_at: string
    booking_id: string
  }

  const { data: bookingRaw } = await admin
    .from("bookings")
    .select(
      "*, client:profiles!bookings_client_id_fkey(id, email, full_name, display_name), counselor:counselors!bookings_counselor_id_fkey(id, profiles!counselors_user_id_fkey(id, email, full_name, display_name))"
    )
    .eq("id", id)
    .single()
  const booking = bookingRaw as unknown as BookingDetail | null
  if (!booking) notFound()

  const { data: paymentRaw } = await admin
    .from("payments")
    .select("*")
    .eq("booking_id", id)
    .maybeSingle()
  const payment = paymentRaw as unknown as PaymentRow | null

  const client = (Array.isArray(booking.client) ? booking.client[0] : booking.client) as Cli | undefined
  const cRaw = (Array.isArray(booking.counselor) ? booking.counselor[0] : booking.counselor) as CounselorWithProfile | undefined
  const counselorProfile = (Array.isArray(cRaw?.profiles) ? cRaw?.profiles?.[0] : cRaw?.profiles) as Cli | undefined

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/admin/bookings" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← 予約一覧
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">予約詳細</h1>
          <Badge variant={booking.status === "cancelled" ? "destructive" : booking.status === "completed" ? "default" : "secondary"}>
            {booking.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>予約情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="ID" value={<code className="text-xs">{booking.id}</code>} />
            <Row label="日時" value={formatDate(booking.scheduled_at)} />
            <Row label="所要時間" value={`${booking.duration_minutes} 分`} />
            <Row label="形式" value={booking.session_type} />
            <Row label="金額" value={`¥${booking.price}`} />
            <Row label="meeting URL" value={booking.meeting_url ? <a href={booking.meeting_url} target="_blank" className="text-emerald-600 hover:underline">開く</a> : "-"} />
            <Row label="作成日" value={formatDate(booking.created_at)} />
            <Row label="メモ" value={booking.notes || "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>関係者</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">クライアント</p>
              <Link
                href={`/dashboard/admin/users/${client?.id}`}
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {client?.display_name || client?.full_name || "-"} ({client?.email})
              </Link>
            </div>
            <div>
              <p className="text-xs text-gray-500">カウンセラー</p>
              <Link
                href={`/dashboard/admin/counselors/${cRaw?.id}`}
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {counselorProfile?.display_name || counselorProfile?.full_name || "-"} ({counselorProfile?.email})
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>支払い情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {payment ? (
            <>
              <Row label="支払い ID" value={<code className="text-xs">{payment.id}</code>} />
              <Row label="状態" value={<Badge variant="secondary">{payment.status}</Badge>} />
              <Row label="金額" value={`¥${payment.amount}`} />
              <Row label="プラットフォーム手数料" value={`¥${payment.platform_fee}`} />
              <Row label="カウンセラー報酬" value={`¥${payment.counselor_payout}`} />
              <Row label="Stripe PI" value={payment.stripe_payment_intent_id ? <code className="text-xs">{payment.stripe_payment_intent_id}</code> : "-"} />
              <Row label="作成日" value={formatDate(payment.created_at)} />
            </>
          ) : (
            <p className="text-gray-500">支払い情報なし</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>管理操作</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            paymentId={payment?.id}
            paymentStatus={payment?.status}
            stripePaymentIntentId={payment?.stripe_payment_intent_id}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-gray-100 text-right">{value}</span>
    </div>
  )
}
