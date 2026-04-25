"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    if (!supabase) {
      setError("認証サービスが利用できません。")
      setLoading(false)
      return
    }
    const redirectTo = `${window.location.origin}/reset-password`
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (err) {
      setError("メール送信に失敗しました。メールアドレスをご確認ください。")
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2"><Heart className="h-8 w-8 text-emerald-600" /></div>
            <CardTitle className="text-2xl">メールを送信しました</CardTitle>
            <CardDescription>
              {email} にパスワードリセット用のメールを送信しました。
              受信箱を確認してリンクをクリックしてください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className="text-sm text-emerald-600 hover:underline">ログインページへ戻る</Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2"><Heart className="h-8 w-8 text-emerald-600" /></div>
          <CardTitle className="text-2xl">パスワードを忘れた方</CardTitle>
          <CardDescription>登録メールアドレスにリセット用リンクを送信します</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "送信中..." : "リセット用リンクを送る"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            <Link href="/login" className="text-emerald-600 hover:underline">ログインに戻る</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
