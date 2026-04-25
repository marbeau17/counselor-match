/**
 * カレンダー連携ヘルパー
 *
 * - generateIcs:   RFC 5545 形式の .ics 文字列を生成（メール添付や直接ダウンロード用）
 * - googleCalendarUrl: ワンクリックで Google Calendar に予約を追加できる URL
 */

interface CalendarEventInput {
  uid: string                    // 予約 UUID 等のユニーク ID
  title: string                  // 件名
  description?: string           // 詳細
  location?: string              // 開催場所 / URL
  startUtc: Date                 // 開始 (UTC)
  endUtc: Date                   // 終了 (UTC)
  organizerEmail?: string        // 主催者
  organizerName?: string
}

function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

function toIcsTime(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  )
}

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

export function generateIcs(ev: CalendarEventInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//counselor-match//JP",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${ev.uid}@counselor-match.app`,
    `DTSTAMP:${toIcsTime(new Date())}`,
    `DTSTART:${toIcsTime(ev.startUtc)}`,
    `DTEND:${toIcsTime(ev.endUtc)}`,
    `SUMMARY:${escapeIcsText(ev.title)}`,
    ev.description ? `DESCRIPTION:${escapeIcsText(ev.description)}` : "",
    ev.location ? `LOCATION:${escapeIcsText(ev.location)}` : "",
    ev.organizerEmail
      ? `ORGANIZER;CN=${escapeIcsText(ev.organizerName || ev.organizerEmail)}:mailto:${ev.organizerEmail}`
      : "",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean)
  return lines.join("\r\n")
}

/**
 * Google Calendar の「予定追加」URL を生成。クリック一発で Google Calendar が開き、
 * フォームが事前入力された状態になる。
 */
export function googleCalendarUrl(ev: CalendarEventInput): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]|(\.\d{3})/g, "")
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${fmt(ev.startUtc)}/${fmt(ev.endUtc)}`,
    details: ev.description || "",
    location: ev.location || "",
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
