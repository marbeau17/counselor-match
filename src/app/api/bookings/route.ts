import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { getStripeOptional } from "@/lib/stripe"
import { generateMeetingUrl } from "@/lib/video"
import { sendBookingConfirmation, sendBookingNotificationToCounselor } from "@/lib/email"
import { notify } from "@/lib/notifications"

// payments テーブルは RLS で書込ポリシーなし → service_role 経由で INSERT
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createSupabaseAdmin(url, serviceKey, { auth: { persistSession: false } })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { counselor_id, session_type, scheduled_at, duration_minutes = 50, notes } = body

    const { data: counselor, error: counselorError } = await supabase
      .from("counselors")
      .select("*")
      .eq("id", counselor_id)
      .eq("is_active", true)
      .single()

    if (counselorError || !counselor) {
      return NextResponse.json({ error: "Counselor not found" }, { status: 404 })
    }

    const price = counselor.hourly_rate
    const commissionRate = counselor.commission_rate ?? 0.2
    const platformFee = Math.round(price * commissionRate)
    const counselorPayout = price - platformFee

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        client_id: user.id,
        counselor_id: counselor.id,
        session_type,
        scheduled_at,
        duration_minutes,
        price,
        notes,
        status: "pending",
      })
      .select()
      .single()

    if (bookingError) {
      console.error("[bookings] insert booking error", bookingError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    // session_type が online の予約には Jitsi meeting URL を生成して保存
    const admin = getAdminClient()
    if (session_type === "online" && admin) {
      const meetingUrl = generateMeetingUrl(booking.id)
      const { data: updated } = await admin
        .from("bookings")
        .update({ meeting_url: meetingUrl })
        .eq("id", booking.id)
        .select()
        .single()
      if (updated) booking.meeting_url = updated.meeting_url
    }

    // payments insert は admin client (service_role) で実行（RLS bypass）
    if (admin) {
      const { error: paymentError } = await admin
        .from("payments")
        .insert({
          booking_id: booking.id,
          client_id: user.id,
          counselor_id: counselor.id,
          amount: price,
          platform_fee: platformFee,
          counselor_payout: counselorPayout,
          currency: "JPY",
          status: "pending",
        })
      if (paymentError) {
        console.error("[bookings] insert payment error (continuing)", paymentError)
      }
    }

    // Stripe Checkout Session (任意機能、未設定時は checkoutUrl: null)
    let checkoutUrl: string | null = null
    const stripe = getStripeOptional()
    if (stripe) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
        const counselorName =
          counselor.profiles?.display_name ||
          counselor.profiles?.full_name ||
          "カウンセラー"
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "jpy",
                product_data: {
                  name: `${counselorName} とのセッション (${duration_minutes}分)`,
                  description: `予約日時: ${new Date(scheduled_at).toLocaleString("ja-JP")}`,
                },
                unit_amount: price,
              },
              quantity: 1,
            },
          ],
          success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
          cancel_url: `${baseUrl}/booking/${counselor.id}?cancelled=1`,
          metadata: {
            booking_id: booking.id,
            counselor_id: counselor.id,
            client_id: user.id,
          },
        })
        checkoutUrl = session.url
      } catch (stripeErr) {
        console.error("[bookings] stripe checkout error (continuing without payment)", stripeErr)
      }
    }

    // メール通知（client + counselor 双方）
    if (admin) {
      try {
        const { data: clientProfile } = await admin
          .from("profiles")
          .select("email, full_name, display_name")
          .eq("id", user.id)
          .single()
        const { data: counselorProfile } = await admin
          .from("profiles")
          .select("email, full_name, display_name")
          .eq("id", counselor.user_id)
          .single()

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
        const counselorName =
          counselorProfile?.display_name ||
          counselorProfile?.full_name ||
          "カウンセラー"
        const clientName =
          clientProfile?.display_name ||
          clientProfile?.full_name ||
          "クライアント"

        // in-app 通知 (fire and forget)
        notify({
          userId: counselor.user_id,
          type: "booking_created",
          title: "新しい予約リクエスト",
          body: `${clientProfile?.display_name || clientProfile?.full_name || "クライアント"}さんから ${new Date(scheduled_at).toLocaleString("ja-JP")} の予約リクエストがあります`,
          url: "/dashboard/counselor",
        }).catch(() => {})

        // 並列送信、失敗しても booking は成立扱い
        await Promise.allSettled([
          clientProfile?.email
            ? sendBookingConfirmation({
                to: clientProfile.email,
                clientName,
                counselorName,
                scheduledAt: scheduled_at,
                durationMinutes: duration_minutes,
                sessionType: session_type,
                meetingUrl: booking.meeting_url,
                bookingId: booking.id,
                appUrl: baseUrl,
              })
            : Promise.resolve(),
          counselorProfile?.email
            ? sendBookingNotificationToCounselor({
                to: counselorProfile.email,
                counselorName,
                clientName,
                scheduledAt: scheduled_at,
                durationMinutes: duration_minutes,
                sessionType: session_type,
                notes,
                appUrl: baseUrl,
              })
            : Promise.resolve(),
        ])
      } catch (mailErr) {
        console.error("[bookings] email notification error (continuing)", mailErr)
      }
    }

    return NextResponse.json({ booking, checkoutUrl })
  } catch (e: unknown) {
    console.error("[bookings] unexpected error", e)
    const message = e instanceof Error ? e.message : "Internal Server Error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
