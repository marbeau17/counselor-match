import { Resend } from "resend"

let _resend: Resend | null = null

function getResend(): Resend | null {
  if (_resend) return _resend
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  _resend = new Resend(key)
  return _resend
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
const FROM_NAME = process.env.RESEND_FROM_NAME || "カウンセラーマッチ"

interface SendArgs {
  to: string
  subject: string
  html: string
}

/**
 * メール送信。RESEND_API_KEY 未設定時は何もしない（ログのみ）。
 * 本番では Resend を使い、ドメイン検証済みアドレスから送信。
 */
export async function sendEmail({ to, subject, html }: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping email to", to)
    return { ok: false, error: "RESEND_API_KEY not configured" }
  }
  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    if (result.error) {
      console.error("[email] send failed", result.error)
      return { ok: false, error: result.error.message }
    }
    return { ok: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown error"
    console.error("[email] exception", e)
    return { ok: false, error: message }
  }
}

// -----------------------------------------------------------------------------
// 予約成立メール（client 宛）
// -----------------------------------------------------------------------------
interface BookingConfirmationArgs {
  to: string
  clientName: string
  counselorName: string
  scheduledAt: string
  durationMinutes: number
  sessionType: string
  meetingUrl?: string | null
  bookingId: string
  appUrl: string
}

export async function sendBookingConfirmation(args: BookingConfirmationArgs) {
  const dateStr = new Date(args.scheduledAt).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
  const sessionTypeLabel: Record<string, string> = {
    online: "オンライン（ビデオ）",
    chat: "チャット",
    phone: "電話",
  }
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: 'Noto Sans JP', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
  <h1 style="font-size: 20px; color: #059669;">予約が確定しました</h1>
  <p>${escapeHtml(args.clientName)}さん、ご予約ありがとうございます。</p>

  <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
    <tr><td style="padding: 8px 0; color: #6b7280; width: 35%;">カウンセラー</td><td style="padding: 8px 0;">${escapeHtml(args.counselorName)} 先生</td></tr>
    <tr><td style="padding: 8px 0; color: #6b7280;">日時</td><td style="padding: 8px 0;">${dateStr}</td></tr>
    <tr><td style="padding: 8px 0; color: #6b7280;">時間</td><td style="padding: 8px 0;">${args.durationMinutes}分</td></tr>
    <tr><td style="padding: 8px 0; color: #6b7280;">形式</td><td style="padding: 8px 0;">${sessionTypeLabel[args.sessionType] || args.sessionType}</td></tr>
  </table>

  ${args.meetingUrl ? `
  <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
    <p style="margin: 0 0 8px 0; font-weight: bold;">セッション当日</p>
    <p style="margin: 0;">開始時刻になりましたら、以下のリンクから入室してください。</p>
    <p style="margin: 12px 0;"><a href="${args.appUrl}/session/${args.bookingId}" style="color: #059669;">セッションに参加する</a></p>
  </div>
  ` : ""}

  <p style="margin-top: 32px;">
    <a href="${args.appUrl}/dashboard/client" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">ダッシュボードを見る</a>
  </p>

  <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;" />
  <p style="font-size: 12px; color: #9ca3af;">
    このメールは カウンセラーマッチ から自動送信されています。<br />
    キャンセルご希望の場合はダッシュボードから操作してください。
  </p>
</body>
</html>
  `.trim()

  return sendEmail({
    to: args.to,
    subject: `【カウンセラーマッチ】予約が確定しました（${dateStr}）`,
    html,
  })
}

// -----------------------------------------------------------------------------
// 予約成立メール（counselor 宛）
// -----------------------------------------------------------------------------
interface BookingNotificationArgs {
  to: string
  counselorName: string
  clientName: string
  scheduledAt: string
  durationMinutes: number
  sessionType: string
  notes?: string | null
  appUrl: string
}

export async function sendBookingNotificationToCounselor(args: BookingNotificationArgs) {
  const dateStr = new Date(args.scheduledAt).toLocaleString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
    hour: "2-digit", minute: "2-digit",
  })
  const sessionTypeLabel: Record<string, string> = {
    online: "オンライン（ビデオ）", chat: "チャット", phone: "電話",
  }
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: 'Noto Sans JP', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
  <h1 style="font-size: 20px; color: #059669;">新しい予約リクエスト</h1>
  <p>${escapeHtml(args.counselorName)} 先生、新しい予約リクエストが届きました。</p>

  <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
    <tr><td style="padding: 8px 0; color: #6b7280; width: 35%;">クライアント</td><td style="padding: 8px 0;">${escapeHtml(args.clientName)}さん</td></tr>
    <tr><td style="padding: 8px 0; color: #6b7280;">日時</td><td style="padding: 8px 0;">${dateStr}</td></tr>
    <tr><td style="padding: 8px 0; color: #6b7280;">時間</td><td style="padding: 8px 0;">${args.durationMinutes}分</td></tr>
    <tr><td style="padding: 8px 0; color: #6b7280;">形式</td><td style="padding: 8px 0;">${sessionTypeLabel[args.sessionType] || args.sessionType}</td></tr>
    ${args.notes ? `<tr><td style="padding: 8px 0; color: #6b7280; vertical-align: top;">メモ</td><td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(args.notes)}</td></tr>` : ""}
  </table>

  <p style="margin-top: 32px;">
    <a href="${args.appUrl}/dashboard/counselor" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">ダッシュボードで承認・確認</a>
  </p>
</body>
</html>
  `.trim()

  return sendEmail({
    to: args.to,
    subject: `【カウンセラーマッチ】新しい予約リクエスト（${dateStr}）`,
    html,
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
