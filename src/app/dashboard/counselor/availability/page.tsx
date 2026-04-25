"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AvailabilityMode } from "@/types/database"

const MODE_OPTIONS: { value: AvailabilityMode; label: string }[] = [
  { value: "offline", label: "オフライン" },
  { value: "accepting_bookings", label: "予約受付中" },
  { value: "machiuke", label: "待機中（今すぐ通話可）" },
]

export default function CounselorAvailabilityPage() {
  const [mode, setMode] = useState<AvailabilityMode>("offline")
  const [onDemand, setOnDemand] = useState(false)
  const [pricePerMinute, setPricePerMinute] = useState<number | "">("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [disabled, setDisabled] = useState(false)
  const [disabledReason, setDisabledReason] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient()
        if (!supabase) {
          setDisabled(true); setDisabledReason("Supabaseが未設定です。"); setLoading(false); return
        }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setDisabled(true); setDisabledReason("ログインが必要です。"); setLoading(false); return }
        const { data: counselor } = await supabase
          .from("counselors").select("*").eq("user_id", user.id).single()
        if (!counselor) { setDisabled(true); setDisabledReason("カウンセラーとして登録されていません。"); setLoading(false); return }
        setMode((counselor.availability_mode as AvailabilityMode) || "offline")
        setOnDemand(!!counselor.on_demand_enabled)
        setPricePerMinute(counselor.price_per_minute ?? "")
      } catch {
        setDisabled(true); setDisabledReason("データ取得に失敗しました。")
      } finally { setLoading(false) }
    })()
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setNotice(null)
    try {
      const res = await fetch("/api/counselor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability_mode: mode,
          on_demand_enabled: onDemand,
          price_per_minute: onDemand && pricePerMinute !== "" ? Number(pricePerMinute) : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) setNotice({ type: "error", text: json.error || "保存に失敗しました" })
      else setNotice({ type: "success", text: "保存しました" })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "保存に失敗しました"
      setNotice({ type: "error", text: message })
    } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">受付状態の設定</h1>
      <Card className="mb-6">
        <CardContent className="p-4 text-sm text-gray-600 dark:text-gray-300">
          待機中にすると、クライアントから即時の通話リクエストが届きます。必要な時だけ切り替えてください。
        </CardContent>
      </Card>
      {disabled && disabledReason && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">{disabledReason}</div>
      )}
      {notice && (
        <div className={`mb-4 rounded-lg p-3 text-sm ${notice.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>{notice.text}</div>
      )}
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader><CardTitle>受付モード</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {MODE_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="availability_mode" value={opt.value} checked={mode === opt.value}
                    onChange={() => setMode(opt.value)} disabled={disabled || loading} />
                  <span className="text-sm text-gray-900 dark:text-gray-100">{opt.label}</span>
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-2 border-t">
              <input type="checkbox" checked={onDemand} onChange={e => setOnDemand(e.target.checked)} disabled={disabled || loading} />
              <span className="text-sm text-gray-900 dark:text-gray-100">オンデマンド通話を受け付ける</span>
            </label>
            {onDemand && (
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">分あたりの料金 (円)</label>
                <input type="number" min={0} value={pricePerMinute}
                  onChange={e => setPricePerMinute(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={disabled || loading}
                  className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">予約価格の1.3–1.5倍を推奨。</p>
              </div>
            )}
            <div className="pt-4">
              <Button type="submit" disabled={disabled || loading || saving}>{saving ? "保存中..." : "保存"}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
