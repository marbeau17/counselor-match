"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Action = "approve" | "decline" | "cancel" | "complete"

const ACTION_TO_STATUS: Record<Action, "confirmed" | "cancelled" | "completed"> = {
  approve: "confirmed",
  decline: "cancelled",
  cancel: "cancelled",
  complete: "completed",
}

const ACTION_LABEL: Record<Action, string> = {
  approve: "承認",
  decline: "辞退",
  cancel: "キャンセル",
  complete: "完了",
}

const ACTION_LOADING_LABEL: Record<Action, string> = {
  approve: "承認中...",
  decline: "辞退中...",
  cancel: "キャンセル中...",
  complete: "完了処理中...",
}

const CONFIRM_MESSAGE: Partial<Record<Action, string>> = {
  decline: "この予約を辞退してよろしいですか？",
  cancel: "この予約をキャンセルしてよろしいですか？",
  complete: "このセッションを完了済みにしますか？",
}

interface BookingActionButtonProps {
  bookingId: string
  action: Action
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function BookingActionButton({ bookingId, action, variant, size }: BookingActionButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    const confirmMsg = CONFIRM_MESSAGE[action]
    if (confirmMsg && !window.confirm(confirmMsg)) return

    setError(null)
    setBusy(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: ACTION_TO_STATUS[action] }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || `Failed (HTTP ${res.status})`)
      startTransition(() => router.refresh())
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "操作に失敗しました"
      setError(message)
      setBusy(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        size={size ?? "sm"}
        variant={variant ?? (action === "approve" || action === "complete" ? "default" : "outline")}
        onClick={handleClick}
        disabled={busy || pending}
      >
        {busy || pending ? ACTION_LOADING_LABEL[action] : ACTION_LABEL[action]}
      </Button>
      {error && <p className="text-xs text-red-600 dark:text-red-400 max-w-[12rem]">{error}</p>}
    </div>
  )
}
