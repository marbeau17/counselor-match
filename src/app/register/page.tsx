"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。")
      setLoading(false)
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setError("認証サービスが利用できません。管理者にお問い合わせください。")
      setLoading(false)
      return
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError("登録に失敗しました。もう一度お試しください。")
      setLoading(false)
      return
    }

    if (data?.session) {
      try {
        fetch("/api/wallet/signup-bonus", { method: "POST" }).catch(() => {})
      } catch {
        // ignore
      }
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">確認メールを送信しました</CardTitle>
            <CardDescription>
              {email} にメールを送信しました。メール内のリンクをクリックして、登録を完了してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
              登録完了で ¥3,000 のウェルカム・ポイントがウォレットに付与されます（14日間有効）。
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href="/login">
              <Button variant="outline">ログインページへ</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <Heart className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <CardDescription>アカウントを作成して始めましょう</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">お名前</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="山田 太郎"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="mail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登録中..." : "無料登録"}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-gray-400 dark:text-gray-500">または</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={async () => {
            const supabase = createClient()
            if (!supabase) {
              setError("認証サービスが利用できません。管理者にお問い合わせください。")
              return
            }
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            })
          }}>
            Googleで登録
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
            既にアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
