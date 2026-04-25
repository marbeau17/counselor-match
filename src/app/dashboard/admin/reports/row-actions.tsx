"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const NEXT_STATUS: Record<string, string[]> = {
  pending: ["reviewing", "resolved", "dismissed"],
  reviewing: ["resolved", "dismissed"],
  resolved: [],
  dismissed: [],
}

export function ReportRowActions({
  reportId,
  status,
}: {
  reportId: string
  status: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const update = (newStatus: string) => {
    setError(null)
    let note: string | null = null
    if (newStatus === "resolved" || newStatus === "dismissed") {
      note = window.prompt(`${newStatus} の理由 / 対応メモ`) ?? null
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, resolution_note: note }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "失敗")
        return
      }
      router.refresh()
    })
  }

  const allowed = NEXT_STATUS[status] || []
  if (allowed.length === 0) return <span className="text-xs text-gray-400">完了</span>

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        {allowed.map((s) => (
          <Button key={s} size="sm" variant="outline" disabled={pending} onClick={() => update(s)}>
            {s}
          </Button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
