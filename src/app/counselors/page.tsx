import { createClient } from "@/lib/supabase/server"
import { CounselorCard } from "@/components/counselor/counselor-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "カウンセラーを探す | カウンセラーマッチ",
  description: "あなたに最適なカウンセラーを見つけましょう。ホリスティック心理学に基づいた経験豊富なカウンセラーが在籍しています。",
}

export default async function CounselorsPage() {
  const supabase = await createClient()

  const { data: counselors } = await supabase
    .from("counselors")
    .select("*, profiles(*)")
    .eq("is_active", true)
    .order("rating_average", { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">カウンセラーを探す</h1>
        <p className="mt-2 text-gray-500">あなたに合ったカウンセラーを見つけましょう</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">キーワード検索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="専門分野、名前..." className="pl-9" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">専門分野</label>
              <div className="space-y-2">
                {["ストレス・不安", "人間関係", "自己成長", "トラウマ", "スピリチュアル", "キャリア"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">セッション形式</label>
              <div className="space-y-2">
                {["オンライン（ビデオ）", "チャット", "電話"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Counselor list */}
        <div className="lg:col-span-3 space-y-4">
          {counselors && counselors.length > 0 ? (
            counselors.map((counselor) => (
              <CounselorCard key={counselor.id} counselor={counselor} />
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">カウンセラーはまだ登録されていません</p>
              <p className="text-gray-400 text-sm mt-2">準備中です。もうしばらくお待ちください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
