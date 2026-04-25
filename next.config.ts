import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (全プロジェクト)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" },
      // 将来用: Google ユーザーコンテンツ
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
}

const sentryEnabled = !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      // Sentry CLI 用 (sourcemap upload)。組織 / プロジェクトは env で渡す。
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      widenClientFileUpload: true,
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
      tunnelRoute: "/monitoring",
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig
