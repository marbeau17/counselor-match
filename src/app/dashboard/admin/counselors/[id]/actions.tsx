"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const LEVELS = ["starter", "professional", "master"] as const
type Level = (typeof LEVELS)[number]

export function CounselorActions({
  counselorId,
  isActive,
  level,
  hourlyRate,
  commissionRate,
}: {
  counselorId: string
  isActive: boolean
  level: string
  hourlyRate: number
  commissionRate: number
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [newLevel, setNewLevel] = useState<Level>((level as Level) || "starter")
  const [newRate, setNewRate] = useState(String(hourlyRate))
  const [newCommission, setNewCommission] = useState(String(commissionRate))
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const send = (body: Record<string, unknown>, successMsg: string) => {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/counselors/${counselorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "更新に失敗しました")
        return
      }
      setMessage(successMsg)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4 text-sm">
      <div>
        <Button
          size="sm"
          variant={isActive ? "outline" : "default"}
          disabled={pending}
          onClick={() => send({ is_active: !isActive }, isActive ? "停止しました" : "承認しました")}
        >
          {isActive ? "停止する" : "承認する"}
        </Button>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Label>レベル</Label>
        <div className="flex gap-2">
          <select
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value as Level)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm flex-1"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <Button
            size="sm"
            disabled={pending || newLevel === level}
            onClick={() => send({ level: newLevel }, "レベルを更新しました")}
          >
            変更
          </Button>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Label>単価 (円/時)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
          />
          <Button
            size="sm"
            disabled={pending || Number(newRate) === hourlyRate || !Number(newRate)}
            onClick={() => send({ hourly_rate: Number(newRate) }, "単価を更新しました")}
          >
            変更
          </Button>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Label>手数料率 (0.0 - 1.0)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={newCommission}
            onChange={(e) => setNewCommission(e.target.value)}
          />
          <Button
            size="sm"
            disabled={pending || Number(newCommission) === commissionRate}
            onClick={() => send({ commission_rate: Number(newCommission) }, "手数料率を更新しました")}
          >
            変更
          </Button>
        </div>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
      {message && <p className="text-emerald-600 text-xs">{message}</p>}
    </div>
  )
}
