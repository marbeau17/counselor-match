// Sentry クライアント側設定。SENTRY_DSN 未設定時は no-op。
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,                      // 10% のリクエストでパフォーマンストレース
    replaysSessionSampleRate: 0.0,              // セッションリプレイは課金考慮で off
    replaysOnErrorSampleRate: 1.0,              // エラー時のみリプレイ
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
  })
}
