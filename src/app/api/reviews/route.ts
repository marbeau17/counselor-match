import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { notify } from "@/lib/notifications"

const ALLOWED_AXES = ["insight", "empathy", "practicality", "approachability", "awareness"] as const
type Axis = typeof ALLOWED_AXES[number]

interface ReviewBody {
  booking_id: string
  rating: number              // 1-5
  comment?: string
  is_anonymous?: boolean
  axes?: { axis: Axis; score: number }[]   // 各 1-5
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createAdmin(url, key, { auth: { persistSession: false } })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json() as ReviewBody
    const { booking_id, rating, comment, is_anonymous, axes } = body

    if (!booking_id || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    // 対象 booking を取得 (RLS で参加者のみ取得可)
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("id, client_id, counselor_id, status")
      .eq("id", booking_id)
      .single()
    if (bookingErr || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    if (booking.client_id !== user.id) {
      return NextResponse.json({ error: "Only the client can review" }, { status: 403 })
    }
    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Only completed bookings can be reviewed" }, { status: 400 })
    }

    // 既存レビューチェック (1 booking 1 review)
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", booking_id)
      .maybeSingle()
    if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 })

    // INSERT review (RLS で client_id = auth.uid() のみ)
    const { data: review, error: insErr } = await supabase
      .from("reviews")
      .insert({
        booking_id,
        client_id: user.id,
        counselor_id: booking.counselor_id,
        rating,
        comment: comment || null,
        is_anonymous: is_anonymous ?? false,
      })
      .select()
      .single()
    if (insErr || !review) {
      console.error("[reviews] insert error", insErr)
      return NextResponse.json({ error: "Failed to insert review" }, { status: 500 })
    }

    // axes は admin client で INSERT (RLS bypass、複数 row 一括)
    const admin = getAdmin()
    if (axes && Array.isArray(axes) && axes.length > 0 && admin) {
      const validAxes = axes
        .filter((a) => ALLOWED_AXES.includes(a.axis) && a.score >= 1 && a.score <= 5)
        .map((a) => ({ review_id: review.id, axis: a.axis, score: a.score }))
      if (validAxes.length > 0) {
        const { error: axErr } = await admin.from("review_axes").insert(validAxes)
        if (axErr) console.error("[reviews] review_axes insert (continuing)", axErr)
      }
    }

    // counselor の rating_average / rating_count を再計算
    if (admin) {
      const { data: stats } = await admin
        .from("reviews")
        .select("rating")
        .eq("counselor_id", booking.counselor_id)
      if (stats && stats.length > 0) {
        const ratings = stats.map((r: { rating: number }) => r.rating)
        const avg = ratings.reduce((s: number, x: number) => s + x, 0) / ratings.length
        await admin
          .from("counselors")
          .update({
            rating_average: Math.round(avg * 10) / 10,
            rating_count: ratings.length,
          })
          .eq("id", booking.counselor_id)
      }
    }

    // counselor (user_id) を取得して通知送信
    if (admin) {
      const { data: counselor } = await admin
        .from("counselors")
        .select("user_id")
        .eq("id", booking.counselor_id)
        .single()
      if (counselor?.user_id) {
        notify({
          userId: counselor.user_id,
          type: "review_received",
          title: "新しいレビューを受領しました",
          body: `★${rating} のレビューが投稿されました`,
          url: "/dashboard/counselor",
        }).catch(() => {})
      }
    }

    return NextResponse.json({ review })
  } catch (e: unknown) {
    console.error("[reviews] unexpected", e)
    const message = e instanceof Error ? e.message : "Internal Server Error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
