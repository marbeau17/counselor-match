import { test, expect } from '@playwright/test'
import { loginAs } from './_auth'

test.describe('Auth - Admin Dashboard', () => {
  test('AC-DA01: admin で訪問 → h1「管理者ダッシュボード」+ 4 KPI Card', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/dashboard/admin')
    await expect(page.getByRole('heading', { name: '管理者ダッシュボード' })).toBeVisible()
    // KPI 4 種 (実装に合わせ「総ユーザー / 活動カウンセラー / 総予約数 / 総収益」)
    await expect(page.getByText('総ユーザー').first()).toBeVisible()
    await expect(page.getByText(/活動カウンセラー|アクティブカウンセラー/).first()).toBeVisible()
    await expect(page.getByText('総予約数').first()).toBeVisible()
    await expect(page.getByText('総収益').first()).toBeVisible()
  })

  test('AC-DA02: 非 admin (client) は admin ダッシュボードへアクセス時に redirect/403 (500 NG)', async ({ page }) => {
    await loginAs(page, 'client')
    const response = await page.goto('/dashboard/admin')
    // 500 系 NG / 200 with 「管理者ダッシュボード」が見えない / もしくは redirect
    expect(response?.status() ?? 200).toBeLessThan(500)
    // 管理者ダッシュボード h1 が見えないこと
    const adminH1 = page.getByRole('heading', { name: '管理者ダッシュボード' })
    await expect(adminH1).toBeHidden({ timeout: 3000 }).catch(async () => {
      // 見えていたらテスト失敗
      throw new Error('non-admin user should not see 管理者ダッシュボード')
    })
  })
})
