import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-bold text-gray-900">カウンセラーマッチ</span>
            </div>
            <p className="text-sm text-gray-500 max-w-md">
              ホリスティック心理学に基づく、あなたに最適なカウンセラーとのマッチングプラットフォーム。
              心・体・精神の統合的なアプローチで、本質的な癒しと成長をサポートします。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">サービス</h3>
            <ul className="space-y-2">
              <li><Link href="/counselors" className="text-sm text-gray-500 hover:text-emerald-600">カウンセラーを探す</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-emerald-600">私たちについて</Link></li>
              <li><Link href="/for-counselors" className="text-sm text-gray-500 hover:text-emerald-600">カウンセラー登録</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">法的情報</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-emerald-600">利用規約</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-emerald-600">プライバシーポリシー</Link></li>
              <li><Link href="/commercial" className="text-sm text-gray-500 hover:text-emerald-600">特定商取引法に基づく表記</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} 合同会社AICREO NEXT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
