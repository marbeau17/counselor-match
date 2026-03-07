import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { counselor_id, session_type, scheduled_at, duration_minutes = 50, notes } = body

  // Get counselor info
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
  const platformFee = Math.round(price * counselor.commission_rate)
  const counselorPayout = price - platformFee

  // Create booking
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
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }

  // Create payment record
  await supabase
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

  // Create Stripe PaymentIntent
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

  return NextResponse.json({
    booking,
    clientSecret: paymentIntent.client_secret,
  })
}
