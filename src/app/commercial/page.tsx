import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | カウンセラーマッチ",
  description: "特定商取引法に基づく表記です。",
}

const ROWS: { label: string; value: string }[] = [
  { label: "販売事業者", value: "合同会社AICREO NEXT" },
  { label: "代表者", value: "小林由起子" },
  { label: "所在地", value: "東京都（請求があった場合は遅滞なく開示します）" },
  { label: "連絡先", value: "本サービス内のお問い合わせフォームよりご連絡ください" },
  { label: "販売価格", value: "各カウンセラーが設定する金額（税込）。詳細は予約時に表示されます" },
  { label: "支払方法", value: "クレジットカード（Stripe を利用）" },
  { label: "支払時期", value: "予約確定時に決済を行います" },
  { label: "サービス提供時期", value: "予約日時にカウンセラーがオンライン・電話・チャットでセッションを提供" },
  { label: "返品・キャンセル", value: "セッション開始の24時間前までは全額返金。それ以降は返金不可（利用規約 第5条参照）" },
  { label: "動作環境", value: "最新のモダンブラウザ（Chrome / Safari / Edge / Firefox）。マイク・カメラ機能" },
]

export default function CommercialPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">特定商取引法に基づく表記</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">最終更新日: 2026年4月25日</p>

      <table className="w-full text-sm md:text-base border-collapse">
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left align-top py-3 pr-4 w-1/3 font-medium text-gray-700 dark:text-gray-200">
                {row.label}
              </th>
              <td className="py-3 text-gray-700 dark:text-gray-200 leading-relaxed">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  )
}
