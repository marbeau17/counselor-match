"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Role = "client" | "counselor" | "admin"

export function UserActions({
  userId,
  currentRole,
  isBanned,
}: {
  userId: string
  currentRole: string
  isBanned: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [role, setRole] = useState<Role>((currentRole as Role) || "client")
  const [banReason, setBanReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const send = (body: Record<string, unknown>, successMsg: string) => {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
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
      {/* Role 変更 */}
      <div className="space-y-2">
        <Label>ロール</Label>
        <div className="flex gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm flex-1"
          >
            <option value="client">client</option>
            <option value="counselor">counselor</option>
            <option value="admin">admin</option>
          </select>
          <Button
            size="sm"
            disabled={pending || role === currentRole}
            onClick={() => send({ role }, "ロールを更新しました")}
          >
            変更
          </Button>
        </div>
      </div>

      {/* BAN */}
      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Label>{isBanned ? "BAN を解除" : "アカウントを BAN"}</Label>
        {!isBanned && (
          <Input
            placeholder="BAN 理由 (任意)"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        )}
        <Button
          size="sm"
          variant={isBanned ? "outline" : "destructive"}
          disabled={pending}
          onClick={() =>
            send(
              { is_banned: !isBanned, banned_reason: isBanned ? null : banReason || null },
              isBanned ? "BAN を解除しました" : "BAN を実行しました"
            )
          }
        >
          {isBanned ? "BAN 解除" : "BAN 実行"}
        </Button>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
      {message && <p className="text-emerald-600 text-xs">{message}</p>}
    </div>
  )
}
