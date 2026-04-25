import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  LayoutDashboard, Users, UserCheck, Calendar, FileText, MessageSquare,
  AlertTriangle, Megaphone, Search, Activity, ShieldCheck,
} from "lucide-react"

const NAV_SECTIONS: { title: string; items: { href: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    title: "概要",
    items: [
      { href: "/dashboard/admin", label: "ダッシュボード", icon: LayoutDashboard },
    ],
  },
  {
    title: "ユーザー管理",
    items: [
      { href: "/dashboard/admin/users", label: "ユーザー", icon: Users },
      { href: "/dashboard/admin/counselors", label: "カウンセラー審査", icon: UserCheck },
    ],
  },
  {
    title: "運用",
    items: [
      { href: "/dashboard/admin/bookings", label: "予約", icon: Calendar },
      { href: "/dashboard/admin/reviews", label: "レビュー", icon: MessageSquare },
      { href: "/dashboard/admin/reports", label: "通報対応", icon: AlertTriangle },
    ],
  },
  {
    title: "コンテンツ",
    items: [
      { href: "/dashboard/admin/columns", label: "コラム", icon: FileText },
      { href: "/dashboard/admin/announcements", label: "お知らせ", icon: Megaphone },
      { href: "/dashboard/admin/seo", label: "SEO 管理", icon: Search },
    ],
  },
  {
    title: "システム",
    items: [
      { href: "/dashboard/admin/audit", label: "監査ログ", icon: ShieldCheck },
      { href: "/dashboard/admin/health", label: "システムヘルス", icon: Activity },
    ],
  },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/dashboard")

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav className="space-y-6 text-sm">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
