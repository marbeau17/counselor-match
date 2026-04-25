import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { isMeetingUrlValid } from "@/lib/video"
import { Video, ArrowLeft } from "lucide-react"

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) redirect("/login")

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/session/${id}`)

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, client_id, counselor_id, session_type, status, scheduled_at, meeting_url, counselor:counselors(id, user_id, profiles(display_name, full_name))")
    .eq("id", id)
    .single()

  if (!booking) notFound()

  // 参加者チェック (client or counselor のいずれか)
  type Counselor = { id: string; user_id: string; profiles?: { display_name?: string; full_name?: string } }
  const counselorRow = (Array.isArray(booking.counselor) ? booking.counselor[0] : booking.counselor) as Counselor | undefined
  const isClient = booking.client_id === user.id
  const isCounselor = counselorRow?.user_id === user.id
  if (!isClient && !isCounselor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">アクセス権がありません</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">このセッションの参加者ではありません。</p>
        <Link href="/dashboard"><Button>ダッシュボードへ</Button></Link>
      </div>
    )
  }

  const meetingUrl = booking.meeting_url
  const counselorName = counselorRow?.profiles?.display_name || counselorRow?.profiles?.full_name || "カウンセラー"

  if (!isMeetingUrlValid(meetingUrl)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Video className="h-12 w-12 mx-auto text-gray-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">ビデオセッション URL が未設定です</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              このセッションは {booking.session_type === "online" ? "オンライン" : booking.session_type} 形式で予約されていますが、
              ビデオ通話 URL が生成されていません。サポートまでお問い合わせください。
            </p>
            <Link href="/dashboard"><Button variant="outline">ダッシュボードへ戻る</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // displayName をクエリで Jitsi に渡す（user_metadata.full_name 優先）
  const displayName = encodeURIComponent(
    (user.user_metadata?.full_name as string | undefined) || user.email || "参加者"
  )
  const embedUrl = `${meetingUrl}#userInfo.displayName="${displayName}"`

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600">
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードへ戻る
        </Link>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {counselorName}先生とのセッション · {new Date(booking.scheduled_at).toLocaleString("ja-JP")}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <iframe
          src={embedUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-[70vh] block"
          title="ビデオセッション"
        />
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        ※ Jitsi Meet ({process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si"}) を利用しています。
        マイク・カメラの許可をブラウザで承認してください。
      </p>
    </div>
  )
}
