import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer
      className="border-t border-accent-quiet/60 bg-base dark:border-gray-700 dark:bg-gray-900"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        フッターナビゲーション
      </h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* ブランド + ミッション */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-5" aria-label="トップへ">
              <Heart className="h-6 w-6 text-accent-primary" />
              <span className="font-serif text-lg text-primary dark:text-gray-100">
                カウンセラーマッチ
              </span>
            </Link>
            <p className="text-sm text-secondary dark:text-gray-400 leading-loose max-w-sm">
              ホリスティック心理学に根ざした、伴走型のオンラインカウンセリング・マッチング。
              急かされない場所で、ゆっくり聴いてくれる人と出会うために。
            </p>
            <p className="font-accent italic text-sm text-accent-primary mt-5">
              — Holistic Counseling for everyday self-care
            </p>
          </div>

          {/* セッション */}
          <nav className="md:col-span-2" aria-labelledby="footer-session">
            <h3 id="footer-session" className="text-xs font-semibold tracking-wider text-primary mb-4 dark:text-gray-100 uppercase">
              セッション
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/counselors" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">カウンセラーを探す</Link></li>
              <li><Link href="/counselors?level=master" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">マスター認定の伴走者</Link></li>
              <li><Link href="/counselors?availability=machiuke" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">いま話せる人</Link></li>
              <li><Link href="/about/screening" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">選考基準</Link></li>
            </ul>
          </nav>

          {/* 内省ツール */}
          <nav className="md:col-span-2" aria-labelledby="footer-tools">
            <h3 id="footer-tools" className="text-xs font-semibold tracking-wider text-primary mb-4 dark:text-gray-100 uppercase">
              内省ツール
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/tools/personality" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">パーソナリティ診断</Link></li>
              <li><Link href="/tools/tarot" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">タロット・リフレクション</Link></li>
              <li><Link href="/tools/compatibility" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">相性診断</Link></li>
              <li><Link href="/column" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">コラム・マガジン</Link></li>
            </ul>
          </nav>

          {/* アカウント */}
          <nav className="md:col-span-2" aria-labelledby="footer-account">
            <h3 id="footer-account" className="text-xs font-semibold tracking-wider text-primary mb-4 dark:text-gray-100 uppercase">
              アカウント
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/login" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">ログイン</Link></li>
              <li><Link href="/register" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">新規登録</Link></li>
              <li><Link href="/forgot-password" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">パスワードを忘れた</Link></li>
              <li><Link href="/for-counselors" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">カウンセラーとして登録</Link></li>
            </ul>
          </nav>

          {/* 運営 */}
          <nav className="md:col-span-2" aria-labelledby="footer-about">
            <h3 id="footer-about" className="text-xs font-semibold tracking-wider text-primary mb-4 dark:text-gray-100 uppercase">
              運営について
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">私たちについて</Link></li>
              <li><Link href="/terms" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">利用規約</Link></li>
              <li><Link href="/privacy" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/commercial" className="text-sm text-secondary hover:text-accent-primary dark:text-gray-400 transition-colors">特定商取引法に基づく表記</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-accent-quiet/60 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted dark:text-gray-500">
            &copy; {new Date().getFullYear()} 合同会社AICREO NEXT. All rights reserved.
          </p>
          <p className="text-xs text-muted dark:text-gray-500 font-accent italic">
            Made with care in Japan
          </p>
        </div>
      </div>
    </footer>
  )
}
