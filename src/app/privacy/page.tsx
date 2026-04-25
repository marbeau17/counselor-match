import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プライバシーポリシー | カウンセラーマッチ",
  description: "カウンセラーマッチの個人情報保護方針です。",
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">プライバシーポリシー</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">最終更新日: 2026年4月25日</p>

      <section className="space-y-6 leading-relaxed text-sm md:text-base">
        <p>合同会社AICREO NEXT（以下「当社」）は、本サービス「カウンセラーマッチ」を通じて取得する個人情報を、以下の方針に基づき適切に取り扱います。</p>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">1. 取得する個人情報</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>氏名、メールアドレス、電話番号</li>
            <li>生年月日（任意）</li>
            <li>セッション履歴、レビュー内容</li>
            <li>支払い情報（決済代行業者経由でのみ取扱、当社は保持しません）</li>
            <li>サービス利用に伴うアクセスログ、Cookie</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">2. 利用目的</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>本サービスの提供・運営・改善</li>
            <li>クライアントとカウンセラーのマッチング</li>
            <li>料金請求・お問い合わせ対応</li>
            <li>新機能・キャンペーン等のご案内</li>
            <li>不正利用の検知・防止</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">3. 第三者提供</h2>
          <p>当社は、法令に基づく場合または以下の場合を除き、利用者の同意なく第三者に個人情報を提供しません。</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>決済処理のため、決済代行業者（Stripe Inc. 等）に必要最小限の情報を提供する場合</li>
            <li>カウンセリングの提供に必要な範囲で、マッチングしたカウンセラーに利用者情報を共有する場合</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">4. 安全管理</h2>
          <p>当社は、個人情報の漏洩、滅失または毀損の防止のため、合理的な安全管理措置を講じます。データは Supabase Inc. の管理する暗号化されたサーバ上に保存されます。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">5. 開示・訂正・削除請求</h2>
          <p>利用者は、当社が保有する自己の個人情報について、開示・訂正・利用停止・削除を求めることができます。お問い合わせ先までご連絡ください。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">6. Cookie</h2>
          <p>本サービスでは、利便性向上のため Cookie を使用します。ブラウザ設定により Cookie を無効にすることができますが、一部機能が利用できなくなる場合があります。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">7. お問い合わせ窓口</h2>
          <p>合同会社AICREO NEXT<br />個人情報保護管理者: 小林由起子<br />お問い合わせは本サービス内の「お問い合わせ」フォームよりお願いいたします。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">8. 改定</h2>
          <p>本ポリシーは、必要に応じて改定することがあります。改定後の内容は本サービス上に掲示した時点から適用されます。</p>
        </div>
      </section>
    </article>
  )
}
