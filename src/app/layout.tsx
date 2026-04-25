import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Serif_JP, Cormorant_Garamond } from "next/font/google"
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

// LP / editorial 用 serif (見出し・引用)
const notoSerifJP = Noto_Serif_JP({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

// 装飾用 italic accent (英文 / カードラベル)
const cormorant = Cormorant_Garamond({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  display: "swap",
})

const SITE_URL = "https://counselors.aicreonext.com"
const SITE_NAME = "カウンセラーマッチ"
const SITE_TAGLINE = "ホリスティック心理カウンセリング"
const SITE_DESCRIPTION =
  "急かされない場所で、誰かに、ゆっくり聞いてほしい。ホリスティック心理学に根ざした、伴走型のオンラインカウンセリング・マッチング。厳選カウンセラーと、対話を通じた静かな自己理解を。"
const OG_IMAGE = `${SITE_URL}/og-image.png`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "カウンセリング",
    "オンラインカウンセリング",
    "ホリスティック心理学",
    "スピリチュアル",
    "心理カウンセラー",
    "セラピスト",
    "メンタルヘルス",
    "自己理解",
    "内省",
    "ジャーナリング",
  ],
  authors: [{ name: "合同会社AICREO NEXT", url: SITE_URL }],
  creator: "合同会社AICREO NEXT",
  publisher: "合同会社AICREO NEXT",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} ヒーロー` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: { email: false, telephone: false },
  category: "health",
}

// Organization + WebSite の JSON-LD (全ページに埋め込み)
const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "Counselor Match",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  description: SITE_DESCRIPTION,
  founder: { "@type": "Person", name: "小林由起子" },
  parentOrganization: {
    "@type": "Organization",
    name: "合同会社AICREO NEXT",
    url: "https://aicreonext.com",
  },
  areaServed: { "@type": "Country", name: "Japan" },
  knowsAbout: [
    "ホリスティック心理学",
    "Soul Mirror Law",
    "オンラインカウンセリング",
    "心理療法",
    "メンタルヘルス",
  ],
  sameAs: [],
}

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "ja-JP",
  description: SITE_DESCRIPTION,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/counselors?keyword={query}` },
    "query-input": "required name=query",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let user = null
  let role: string | null = null
  try {
    const supabase = await createClient()
    if (supabase) {
      const { data } = await supabase.auth.getUser()
      user = data.user
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        role = (profile?.role as string | undefined) ?? null
      }
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
        {/* SEO: Organization + WebSite 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifJP.variable} ${cormorant.variable} antialiased bg-base text-primary dark:bg-gray-950 dark:text-gray-100`}
      >
        <div className="flex min-h-screen flex-col">
          <Header
            user={user ? { email: user.email ?? "", full_name: user.user_metadata?.full_name, role } : null}
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
