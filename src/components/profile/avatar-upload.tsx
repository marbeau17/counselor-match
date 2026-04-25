"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface AvatarUploadProps {
  userId: string
  currentUrl?: string | null
  fullName?: string
}

export function AvatarUpload({ userId, currentUrl, fullName }: AvatarUploadProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null)

  const handleFile = async (file: File) => {
    setError(null)
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("ファイルサイズは 2MB 以内にしてください")
      return
    }
    setBusy(true)
    const supabase = createClient()
    if (!supabase) {
      setError("接続できません")
      setBusy(false)
      return
    }

    // 拡張子保持
    const ext = file.name.split(".").pop()?.toLowerCase() || "png"
    const path = `${userId}/avatar-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) {
      setError(upErr.message || "アップロードに失敗しました")
      setBusy(false)
      return
    }

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path)
    const newUrl = pub.publicUrl

    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("id", userId)
    if (updErr) {
      setError(updErr.message || "プロフィール更新に失敗しました")
      setBusy(false)
      return
    }

    setPreviewUrl(newUrl)
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={previewUrl || undefined} alt={fullName || ""} size="xl" />
      <div className="flex flex-col gap-2">
        <label htmlFor="avatar-input">
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => document.getElementById("avatar-input")?.click()}
          >
            {busy ? "アップロード中..." : "画像を変更"}
          </Button>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">JPG / PNG / WebP, 2MB まで</p>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  )
}
