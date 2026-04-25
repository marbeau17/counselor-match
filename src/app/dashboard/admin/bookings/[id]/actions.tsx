"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function BookingActions({
  bookingId,
  status,
  paymentId,
  paymentStatus,
  stripePaymentIntentId,
}: {
  bookingId: string
  status: string
  paymentId?: string
  paymentStatus?: string
  stripePaymentIntentId?: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const updateStatus = (newStatus: string, msg: string) => {
    if (!confirm(`本当に「${newStatus}」に変更しますか?`)) return
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "更新に失敗しました")
        return
      }
      setMessage(msg)
      router.refresh()
    })
  }

  const refund = () => {
    if (!paymentId) return
    if (!confirm("Stripe で全額返金しますか? この操作は取り消せません。")) return
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: "POST",
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "返金に失敗しました")
        return
      }
      setMessage("返金が完了しました")
      router.refresh()
    })
  }

  const canRefund = paymentId && stripePaymentIntentId && paymentStatus !== "refunded"

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        {status === "pending" && (
          <>
            <Button size="sm" disabled={pending} onClick={() => updateStatus("confirmed", "確定しました")}>
              強制確定
            </Button>
            <Button size="sm" variant="destructive" disabled={pending} onClick={() => updateStatus("cancelled", "キャンセルしました")}>
              キャンセル
            </Button>
          </>
        )}
        {status === "confirmed" && (
          <>
            <Button size="sm" disabled={pending} onClick={() => updateStatus("completed", "完了にしました")}>
              強制完了
            </Button>
            <Button size="sm" variant="destructive" disabled={pending} onClick={() => updateStatus("cancelled", "キャンセルしました")}>
              キャンセル
            </Button>
          </>
        )}
        {(status === "completed" || status === "cancelled") && (
          <p className="text-gray-500">この予約は終端ステータスです</p>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || !canRefund}
          onClick={refund}
        >
          全額返金 (Stripe)
        </Button>
        {!canRefund && paymentStatus === "refunded" && (
          <p className="mt-1 text-xs text-gray-500">返金済み</p>
        )}
        {!canRefund && !stripePaymentIntentId && paymentId && (
          <p className="mt-1 text-xs text-gray-500">Stripe PI が記録されていないため返金不可</p>
        )}
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
      {message && <p className="text-emerald-600 text-xs">{message}</p>}
    </div>
  )
}
