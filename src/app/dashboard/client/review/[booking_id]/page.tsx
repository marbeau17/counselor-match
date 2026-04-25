import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReviewForm } from "./ReviewForm"

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ booking_id: string }>
}) {
  const { booking_id } = await params
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/dashboard/client/review/${booking_id}`)

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, client_id, status, scheduled_at, counselor:counselors(id, profiles(display_name, full_name))")
    .eq("id", booking_id)
    .single()
  if (!booking) notFound()
  if (booking.client_id !== user.id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">アクセス権がありません</h1>
      </div>
    )
  }
  if (booking.status !== "completed") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">レビュー投稿は完了したセッションのみ可能です</h1>
        <p className="text-gray-600 dark:text-gray-300">セッション完了後に再度ご利用ください。</p>
      </div>
    )
  }

  // 既存レビュー確認
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", booking_id)
    .maybeSingle()
  if (existing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">このセッションのレビューは既に投稿済みです</h1>
      </div>
    )
  }

  type Counselor = { id: string; profiles?: { display_name?: string; full_name?: string } }
  const c = (Array.isArray(booking.counselor) ? booking.counselor[0] : booking.counselor) as Counselor | undefined
  const counselorName = c?.profiles?.display_name || c?.profiles?.full_name || "カウンセラー"

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">レビューを投稿する</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {counselorName}先生とのセッション ({new Date(booking.scheduled_at).toLocaleDateString("ja-JP")})
      </p>
      <ReviewForm bookingId={booking_id} counselorName={counselorName} />
    </div>
  )
}
