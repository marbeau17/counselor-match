import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "利用規約 | カウンセラーマッチ",
  description: "カウンセラーマッチをご利用いただく上での利用規約です。",
}

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">利用規約</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">最終更新日: 2026年4月25日</p>

      <section className="space-y-6 leading-relaxed text-sm md:text-base">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">第1条（適用）</h2>
          <p>本規約は、合同会社AICREO NEXT（以下「当社」）が提供する「カウンセラーマッチ」（以下「本サービス」）の利用に関する条件を、本サービスを利用するすべての利用者（以下「利用者」）と当社との間で定めるものです。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">第2条（定義）</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>「クライアント」: 本サービスを通じてカウンセリングを受ける利用者</li>
            <li>「カウンセラー」: 本サービス上で審査を経てカウンセリングを提供する利用者</li>
            <li>「セッション」: クライアントとカウンセラーの間で行われるカウンセリングの単位</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">第3条（アカウント登録）</h2>
          <p>利用者は、当社の定める手続に従いアカウント登録を行うものとします。登録情報は正確かつ最新の状態に維持してください。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">第4条（料金・支払い）</h2>
          <p>セッション料金は、各カウンセラーが個別に設定し、本サービス上に表示される金額に従います。決済は予約確定時に行われます。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">第5条（キャンセル・返金）</h2>
          <p>セッション開始の24時間前までのキャンセルは全額返金、それ以降のキャンセルは原則として返金いたしかねます。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">第6条（禁止事項）</h2>
          <p>利用者は、本サービスの利用にあたり以下の行為をしてはなりません。</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>法令または公序良俗に違反する行為</li>
            <li>他の利用者または第三者の権利を侵害する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>診断・治療行為と誤認される表現での助言</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">第7条（免責事項）</h2>
          <p>本サービスはカウンセリングの場を提供するものであり、医療行為・診断ではありません。緊急時の医療相談は専門医療機関へお問い合わせください。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">第8条（規約の変更）</h2>
          <p>当社は、必要と判断した場合に本規約を変更することができます。変更後の規約は本サービス上に掲示した時点から効力を生じます。</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">第9条（準拠法・管轄）</h2>
          <p>本規約の準拠法は日本法とし、本サービスに関して紛争が生じた場合、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-12">合同会社AICREO NEXT</p>
      </section>
    </article>
  )
}
