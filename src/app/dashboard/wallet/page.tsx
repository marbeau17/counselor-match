import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  getOrCreateWallet,
  listWalletTransactions,
  WALLET_TOPUP_DENOMINATIONS,
} from "@/lib/wallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatDate } from "@/lib/utils"
import type { WalletTxType } from "@/types/database"
import { TopUpButtons } from "./TopUpButtons"

const TX_TYPE_LABELS: Record<WalletTxType, string> = {
  topup: "入金",
  session_charge: "セッション利用",
  signup_bonus: "新規登録ボーナス",
  referral_bonus: "紹介ボーナス",
  refund: "返金",
}

export default async function WalletPage() {
  const supabase = await createClient()
  if (!supabase) redirect("/login")
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const wallet = await getOrCreateWallet(user.id)
  const transactions = await listWalletTransactions(user.id, 20)
  const balance = wallet?.balance_yen ?? 0

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ポイントウォレット</h1>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">セッション料金に使える前払いポイント</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>現在の残高</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-emerald-600">
            {formatPrice(balance)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            ※ ボーナスとして付与されたポイントには有効期限があり、期限を過ぎると失効する場合があります。
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>ポイントを追加する</CardTitle>
        </CardHeader>
        <CardContent>
          <TopUpButtons denominations={[...WALLET_TOPUP_DENOMINATIONS]} />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            ご希望の金額を選択してください。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>取引履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    <th className="py-2 pr-4 font-medium">日付</th>
                    <th className="py-2 pr-4 font-medium">種別</th>
                    <th className="py-2 pr-4 font-medium text-right">金額</th>
                    <th className="py-2 font-medium">メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const amount = tx.amount_yen ?? 0
                    const isPositive = amount >= 0
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300 dark:text-gray-600 whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="py-3 pr-4 text-gray-700 dark:text-gray-200">
                          {TX_TYPE_LABELS[tx.type] ?? tx.type}
                        </td>
                        <td
                          className={`py-3 pr-4 text-right font-medium whitespace-nowrap ${
                            isPositive ? "text-emerald-600" : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {isPositive ? "+" : "-"}
                          {formatPrice(Math.abs(amount))}
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400 dark:text-gray-500">{tx.note ?? ""}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-center py-8">取引履歴はありません</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
