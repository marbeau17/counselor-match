import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { notify } from "@/lib/notifications"
import type { BookingStatus } from "@/types/database"

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],   // counselor: confirmed/cancelled, client: cancelled
  confirmed: ["completed", "cancelled"], // counselor: completed, both: cancelled
  completed: [],
  cancelled: [],
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createAdmin(url, key, { auth: { persistSession: false } })
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const supabase = await createServerClient()
    if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const newStatus = body.status as BookingStatus
    if (!newStatus || !["confirmed", "cancelled", "completed"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // 対象 booking 取得 (RLS により参加者のみ取得可)
    const { data: booking, error: fetchErr } = await supabase
      .from("bookings")
      .select("id, client_id, counselor_id, status, counselor:counselors(user_id)")
      .eq("id", id)
      .single()
    if (fetchErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // 状態遷移チェック
    const currentStatus = booking.status as BookingStatus
    if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${newStatus}` },
        { status: 400 }
      )
    }

    type CounselorRef = { user_id: string }
    const counselor = (Array.isArray(booking.counselor) ? booking.counselor[0] : booking.counselor) as CounselorRef | undefined
    const isClient = booking.client_id === user.id
    const isCounselor = counselor?.user_id === user.id

    // 権限チェック
    // - confirmed: counselor のみ
    // - completed: counselor のみ
    // - cancelled: 両者可
    if (newStatus === "confirmed" && !isCounselor) {
      return NextResponse.json({ error: "Only the counselor can confirm" }, { status: 403 })
    }
    if (newStatus === "completed" && !isCounselor) {
      return NextResponse.json({ error: "Only the counselor can complete" }, { status: 403 })
    }
    if (newStatus === "cancelled" && !isClient && !isCounselor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 更新は admin client で実行（RLS で UPDATE 可だが confirmed→completed の遷移を確実に通すため）
    const admin = getAdmin() ?? supabase
    const { data: updated, error: updErr } = await admin
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single()

    if (updErr) {
      console.error("[bookings/status] update error", updErr)
      return NextResponse.json({ error: "Failed to update" }, { status: 500 })
    }

    // 状態変更通知 (相手側に飛ばす)
    const targetUserId = newStatus === "cancelled"
      ? (isClient ? counselor?.user_id : booking.client_id)
      : booking.client_id  // confirmed / completed は client へ
    if (targetUserId) {
      const titleMap: Record<string, string> = {
        confirmed: "予約が承認されました",
        cancelled: "予約がキャンセルされました",
        completed: "セッションが完了しました",
      }
      notify({
        userId: targetUserId,
        type: `booking_${newStatus}`,
        title: titleMap[newStatus] || "予約が更新されました",
        url: isClient ? "/dashboard/client" : "/dashboard/counselor",
      }).catch(() => {})
    }

    return NextResponse.json({ booking: updated })
  } catch (e: unknown) {
    console.error("[bookings/status] unexpected", e)
    const message = e instanceof Error ? e.message : "Internal Server Error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
