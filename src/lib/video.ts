/**
 * ビデオ通話 URL 生成。
 *
 * デフォルトは Jitsi Meet (meet.jit.si) を利用。
 * - サインアップ不要、無料、オープンソース
 * - room 名に booking UUID を埋め込んで一意性を確保
 * - URL を知っている人なら誰でも参加できるが、UUID なので推測不可
 *
 * 将来 Daily.co / Whereby / Zoom 等に切り替える場合は `generateMeetingUrl` を
 * 環境変数で分岐させる（NEXT_PUBLIC_VIDEO_PROVIDER=daily 等）。
 */

const JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? 'meet.jit.si'
const ROOM_PREFIX = 'counselor-match'

export function generateMeetingUrl(bookingId: string): string {
  // booking UUID をそのまま room 名にすることで、同じ予約は同じ URL に
  return `https://${JITSI_DOMAIN}/${ROOM_PREFIX}-${bookingId}`
}

export function isMeetingUrlValid(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const u = new URL(url)
    return u.hostname === JITSI_DOMAIN || u.hostname.endsWith('.daily.co')
  } catch {
    return false
  }
}
