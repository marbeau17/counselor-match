"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Initial {
  title: string
  bio: string
  specialties: string
  certifications: string
  hourly_rate: number
}

export function CounselorProfileForm({ counselorId, initial }: { counselorId: string; initial: Initial }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)
    setBusy(true)
    const supabase = createClient()
    if (!supabase) {
      setNotice({ type: "error", text: "接続できません" })
      setBusy(false)
      return
    }
    const specialties = form.specialties.split(",").map((s) => s.trim()).filter(Boolean)
    const certifications = form.certifications.split(",").map((s) => s.trim()).filter(Boolean)
    const { error: err } = await supabase
      .from("counselors")
      .update({
        title: form.title.trim() || null,
        bio: form.bio,
        specialties,
        certifications,
        hourly_rate: Math.max(1000, Math.floor(form.hourly_rate)),
      })
      .eq("id", counselorId)
    if (err) {
      setNotice({ type: "error", text: err.message || "保存に失敗しました" })
      setBusy(false)
      return
    }
    setNotice({ type: "success", text: "保存しました" })
    setBusy(false)
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="title">肩書き</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="ホリスティック心理カウンセラー"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={6}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="specialties">専門分野（カンマ区切り）</Label>
            <Input
              id="specialties"
              value={form.specialties}
              onChange={(e) => setForm({ ...form, specialties: e.target.value })}
              placeholder="ホリスティック心理学, トラウマケア, グリーフケア"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="certifications">資格・認定（カンマ区切り）</Label>
            <Input
              id="certifications"
              value={form.certifications}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
              placeholder="臨床心理士, ホリスティック心理学マスター認定"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="hourly_rate">時給（円）</Label>
            <Input
              id="hourly_rate"
              type="number"
              min={1000}
              step={500}
              value={form.hourly_rate}
              onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
              className="mt-1 w-48"
            />
          </div>

          {notice && (
            <div className={`text-sm rounded-md p-3 ${
              notice.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}>
              {notice.text}
            </div>
          )}

          <Button type="submit" disabled={busy}>
            {busy ? "保存中..." : "プロフィールを保存"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
