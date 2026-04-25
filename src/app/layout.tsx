import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "カウンセラーマッチ | ホリスティック心理カウンセリング",
  description:
    "ホリスティック心理学に基づくオンラインカウンセリングマッチングプラットフォーム",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let user = null
  try {
    const supabase = await createClient()
    if (supabase) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }
  } catch {
    // Supabase 未設定または通信エラーは匿名ユーザー扱い
  }

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* OS のダーク設定 or localStorage("theme") を読み、初回描画前に <html class="dark"> を確定 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}
      >
        <div className="flex min-h-screen flex-col">
          <Header
            user={user ? { email: user.email ?? "", full_name: user.user_metadata?.full_name } : null}
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
