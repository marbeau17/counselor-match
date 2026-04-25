import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CounselorProfileForm } from "./CounselorProfileForm"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CounselorProfilePage() {
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: counselor } = await supabase
    .from("counselors")
    .select("id, title, bio, specialties, certifications, hourly_rate")
    .eq("user_id", user.id)
    .single()

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url, display_name, full_name")
    .eq("id", user.id)
    .single()

  if (!counselor) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">カウンセラー登録が必要です</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          このページはカウンセラーとして登録されているユーザー専用です。
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">プロフィール編集</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        プロフィールページに表示される情報を編集できます。
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">プロフィール画像</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            userId={user.id}
            currentUrl={profile?.avatar_url}
            fullName={profile?.display_name || profile?.full_name || undefined}
          />
        </CardContent>
      </Card>

      <CounselorProfileForm
        counselorId={counselor.id}
        initial={{
          title: counselor.title || "",
          bio: counselor.bio || "",
          specialties: (counselor.specialties || []).join(", "),
          certifications: (counselor.certifications || []).join(", "),
          hourly_rate: counselor.hourly_rate ?? 5000,
        }}
      />
    </div>
  )
}
