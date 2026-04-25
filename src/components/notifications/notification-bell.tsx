"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  url: string | null
  read_at: string | null
  created_at: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = createClient()
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("notifications")
        .select("id, type, title, body, url, read_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
      if (cancelled) return
      setItems((data as Notification[]) ?? [])
    }
    load()
    // 60 秒ごとにポーリング (Realtime 統合は将来)
    const t = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  const unreadCount = items.filter((n) => !n.read_at).length

  const markAllRead = async () => {
    if (busy || unreadCount === 0) return
    setBusy(true)
    const supabase = createClient()
    if (!supabase) { setBusy(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); return }
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null)
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })))
    setBusy(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600"
        aria-label={`通知 (未読 ${unreadCount} 件)`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-[1rem] rounded-full bg-emerald-600 text-white text-[10px] font-bold px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">通知</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
                  disabled={busy}
                >
                  すべて既読にする
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="px-3 py-6 text-sm text-gray-400 text-center">通知はありません</p>
            ) : (
              <ul>
                {items.map((n) => {
                  const inner = (
                    <div className={`px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${!n.read_at ? "bg-emerald-50/30 dark:bg-emerald-950/20" : ""}`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                      {n.body && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.created_at).toLocaleString("ja-JP")}</p>
                    </div>
                  )
                  return (
                    <li key={n.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      {n.url ? <Link href={n.url} onClick={() => setOpen(false)}>{inner}</Link> : inner}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
