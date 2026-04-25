import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { AvailabilityMode } from "@/types/database"

const ALLOWED_MODES: AvailabilityMode[] = ["offline", "accepting_bookings", "machiuke"]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { availability_mode, on_demand_enabled, price_per_minute } = body ?? {}

    if (!ALLOWED_MODES.includes(availability_mode)) {
      return NextResponse.json({ error: "invalid availability_mode" }, { status: 400 })
    }
    if (price_per_minute !== undefined && price_per_minute !== null) {
      if (typeof price_per_minute !== "number" || price_per_minute < 0) {
        return NextResponse.json({ error: "invalid price_per_minute" }, { status: 400 })
      }
    }

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: "service unavailable" }, { status: 503 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data: counselor } = await supabase
      .from("counselors")
      .select("id")
      .eq("user_id", user.id)
      .single()
    if (!counselor) return NextResponse.json({ error: "forbidden" }, { status: 403 })

    const update: Record<string, unknown> = { availability_mode }
    if (on_demand_enabled !== undefined) update.on_demand_enabled = !!on_demand_enabled
    if (price_per_minute !== undefined) update.price_per_minute = price_per_minute

    const { data: updated, error } = await supabase
      .from("counselors")
      .update(update)
      .eq("id", counselor.id)
      .select("*")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, counselor: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 })
  }
}
