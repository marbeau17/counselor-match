import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { issueSignupBonus } from "@/lib/wallet"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=supabase_unavailable`)
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          try {
            await issueSignupBonus(user.id)
          } catch (e) {
            console.error("[auth/callback] issueSignupBonus error", e)
          }
        }
      } catch (e) {
        console.error("[auth/callback] getUser error", e)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
