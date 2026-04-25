"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function ReviewRowActions({
  reviewId,
  isHidden,
}: {
  reviewId: string
  isHidden: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const toggle = () => {
    setError(null)
    let reason: string | null = null
    if (!isHidden) {
      reason = window.prompt("非表示理由 (任意)") ?? null
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_hidden: !isHidden,
          hidden_reason: !isHidden ? reason : null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "失敗")
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant={isHidden ? "outline" : "destructive"}
        disabled={pending}
        onClick={toggle}
      >
        {isHidden ? "再表示" : "非表示"}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
