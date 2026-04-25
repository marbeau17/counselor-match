import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateIcs } from "@/lib/calendar"

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, scheduled_at, duration_minutes, session_type, meeting_url, counselor:counselors(profiles(display_name, full_name))")
    .eq("id", id)
    .single()
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  type Counselor = { profiles?: { display_name?: string; full_name?: string } }
  const c = (Array.isArray(booking.counselor) ? booking.counselor[0] : booking.counselor) as Counselor | undefined
  const counselorName = c?.profiles?.display_name || c?.profiles?.full_name || "カウンセラー"

  const start = new Date(booking.scheduled_at)
  const end = new Date(start.getTime() + (booking.duration_minutes ?? 50) * 60_000)

  const ics = generateIcs({
    uid: booking.id,
    title: `カウンセリングセッション - ${counselorName}先生`,
    description: booking.meeting_url
      ? `セッション形式: ${booking.session_type}\n参加 URL: ${booking.meeting_url}`
      : `セッション形式: ${booking.session_type}`,
    location: booking.meeting_url || "",
    startUtc: start,
    endUtc: end,
  })

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="counselor-match-${booking.id}.ics"`,
    },
  })
}
