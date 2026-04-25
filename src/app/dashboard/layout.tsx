import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  if (!supabase) redirect("/login")

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <>{children}</>
}
