import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi, logAdminAction } from "@/lib/admin"
import { getStripeOptional } from "@/lib/stripe"

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { admin, userId: actorId } = auth
  if (!admin) return NextResponse.json({ error: "Service role not configured" }, { status: 503 })

  const stripe = getStripeOptional()
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 })

  const { data: payment, error: fetchErr } = await admin
    .from("payments")
    .select("id, status, amount, stripe_payment_intent_id, booking_id")
    .eq("id", id)
    .single()

  if (fetchErr || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }
  if (!payment.stripe_payment_intent_id) {
    return NextResponse.json({ error: "Stripe PaymentIntent が記録されていません" }, { status: 400 })
  }
  if (payment.status === "refunded") {
    return NextResponse.json({ error: "既に返金済みです" }, { status: 400 })
  }

  let refundId: string | undefined
  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
    })
    refundId = refund.id
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Stripe refund 失敗"
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  const { data: updated, error: updErr } = await admin
    .from("payments")
    .update({ status: "refunded" })
    .eq("id", id)
    .select("id, status")
    .single()
  if (updErr) {
    console.error("[refund] DB update", updErr)
  }

  // 予約も cancelled に
  await admin
    .from("bookings")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", payment.booking_id)

  await logAdminAction({
    actorId,
    action: "payment.refund",
    targetType: "payment",
    targetId: id,
    before: { status: payment.status },
    after: { status: "refunded", refund_id: refundId },
  })

  return NextResponse.json({ payment: updated, refund_id: refundId })
}
