"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function SettingsForm({
  hasGeminiKey,
  geminiModel,
}: {
  hasGeminiKey: boolean
  geminiModel: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editingKey, setEditingKey] = useState(!hasGeminiKey)
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState(geminiModel)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const saveKey = () => {
    if (!apiKey) return
    setError(null); setMessage(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "gemini.api_key", value: apiKey, is_secret: true }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "保存失敗")
        return
      }
      setMessage("保存しました")
      setApiKey("")
      setEditingKey(false)
      router.refresh()
    })
  }

  const saveModel = () => {
    setError(null); setMessage(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "gemini.image_model", value: model, is_secret: false }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "保存失敗")
        return
      }
      setMessage("保存しました")
      router.refresh()
    })
  }

  const test = () => {
    setTestResult(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/settings/test-gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiKey ? { key: apiKey } : {}),
      })
      const j = await res.json().catch(() => ({ ok: false, message: "通信失敗" }))
      setTestResult(j)
    })
  }

  return (
    <div className="space-y-5 text-sm">
      <div>
        <Label>API キー</Label>
        {editingKey ? (
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <Input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="flex-1"
            />
            <Button size="sm" disabled={pending || !apiKey} onClick={saveKey}>保存</Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={test}>テスト</Button>
            {hasGeminiKey && (
              <Button size="sm" variant="outline" onClick={() => { setEditingKey(false); setApiKey("") }}>キャンセル</Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="default">設定済み</Badge>
            <code className="text-xs">••••••••••••</code>
            <Button size="sm" variant="outline" onClick={() => setEditingKey(true)}>再設定</Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={test}>疎通テスト</Button>
          </div>
        )}
        {testResult && (
          <p className={`mt-2 text-xs ${testResult.ok ? "text-emerald-600" : "text-red-600"}`}>
            {testResult.ok ? "✓ " : "✗ "}{testResult.message}
          </p>
        )}
      </div>

      <div>
        <Label>画像生成モデル</Label>
        <div className="flex gap-2 mt-1">
          <Input value={model} onChange={(e) => setModel(e.target.value)} className="flex-1" />
          <Button size="sm" disabled={pending || model === geminiModel} onClick={saveModel}>更新</Button>
        </div>
        <p className="mt-1 text-xs text-gray-500">デフォルト: gemini-3-pro-image-preview</p>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
      {message && <p className="text-emerald-600 text-xs">{message}</p>}
    </div>
  )
}
