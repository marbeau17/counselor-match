import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { getStripeOptional } from "@/lib/stripe"
import { generateMeetingUrl } from "@/lib/video"

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

    // Stripe PaymentIntent (任意機能、未設定時は clientSecret: null で完了)
    let clientSecret: string | null = null
    const stripe = getStripeOptional()
    if (stripe) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: price,
          currency: "jpy",
          metadata: {
            booking_id: booking.id,
            counselor_id: counselor.id,
            client_id: user.id,
          },
          ...(counselor.stripe_account_id && {
            transfer_data: {
              destination: counselor.stripe_account_id,
              amount: counselorPayout,
            },
          }),
        })
        clientSecret = paymentIntent.client_secret
      } catch (stripeErr) {
        console.error("[bookings] stripe error (continuing without payment intent)", stripeErr)
      }
    }

    return NextResponse.json({ booking, clientSecret })
  } catch (e: unknown) {
    console.error("[bookings] unexpected error", e)
    const message = e instanceof Error ? e.message : "Internal Server Error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
