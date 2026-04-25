import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWalletBalance, issueSignupBonus } from "@/lib/wallet"

export async function POST() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "service unavailable" }, { status: 503 })
    }
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }

    let tx = null
    try {
      tx = await issueSignupBonus(user.id)
    } catch (err) {
      console.error("[signup-bonus] issueSignupBonus error", err)
    }

    let balance_yen = 0
    try {
      balance_yen = await getWalletBalance(user.id)
    } catch (err) {
      console.error("[signup-bonus] getWalletBalance error", err)
    }

    return NextResponse.json({
      ok: true,
      issued: tx !== null,
      balance_yen,
    })
  } catch (err) {
    console.error("[signup-bonus] unexpected error", err)
    return NextResponse.json({ ok: true, issued: false, balance_yen: 0 })
  }
}
