import { test, expect } from '@playwright/test'
import { loginAs } from './_auth'

test.describe('Auth - Admin sub-pages (AC-DAS01-13)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('AC-DAS01 Users (/dashboard/admin/users)', async ({ page }) => {
    await page.goto('/dashboard/admin/users')
    await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toBeVisible()
    // 「適用」filter Btn または「詳細」link が少なくとも 1 つ存在
    const hasFilterOrDetail = page.getByRole('button', { name: '適用' })
      .or(page.getByRole('link', { name: '詳細' }))
    await expect(hasFilterOrDetail.first()).toBeVisible()
  })

  test('AC-DAS02 Counselors (/dashboard/admin/counselors)', async ({ page }) => {
    await page.goto('/dashboard/admin/counselors')
    await expect(page.getByRole('heading', { name: 'カウンセラー審査' })).toBeVisible()
    // select の option ではなく tbody の Badge を見る
    const badge = page.locator('tbody').getByText(/承認済|未承認/)
    await expect(badge.first()).toBeVisible({ timeout: 10000 })
  })

  test('AC-DAS03 Bookings (/dashboard/admin/bookings)', async ({ page }) => {
    await page.goto('/dashboard/admin/bookings')
    await expect(page.getByRole('heading', { name: '予約管理' })).toBeVisible()
    // seed bookings あり、「詳細」 link 表示確認
    await expect(page.getByRole('link', { name: '詳細' }).first()).toBeVisible()
  })

  test('AC-DAS04 Columns (/dashboard/admin/columns)', async ({ page }) => {
    await page.goto('/dashboard/admin/columns')
    await expect(page.getByRole('heading', { name: 'コラム管理' })).toBeVisible()
    // 「新規作成」リンクが表示されていれば管理画面が描画できている
    await expect(page.getByRole('link', { name: '新規作成' }).first()).toBeVisible()
  })

  test('AC-DAS05 Announcements (/dashboard/admin/announcements)', async ({ page }) => {
    await page.goto('/dashboard/admin/announcements')
    await expect(page.getByRole('heading', { name: 'お知らせ管理' })).toBeVisible()
    await expect(page.getByText('新規お知らせ')).toBeVisible()
    await expect(page.getByText('一覧')).toBeVisible()
  })

  test('AC-DAS06 Reports (/dashboard/admin/reports)', async ({ page }) => {
    await page.goto('/dashboard/admin/reports')
    await expect(page.getByRole('heading', { name: '通報対応' })).toBeVisible()
    // empty state 許容 (データ 0 件)
  })

  test('AC-DAS07 Reviews (/dashboard/admin/reviews)', async ({ page }) => {
    await page.goto('/dashboard/admin/reviews')
    await expect(page.getByRole('heading', { name: 'レビュー管理' })).toBeVisible()
    // seed review 6 件、tbody の Badge を確認
    const badge = page.locator('tbody').getByText(/表示中|非表示/)
    await expect(badge.first()).toBeVisible({ timeout: 10000 })
  })

  test('AC-DAS08 SEO (/dashboard/admin/seo)', async ({ page }) => {
    await page.goto('/dashboard/admin/seo')
    await expect(page.getByRole('heading', { name: 'SEO 管理' })).toBeVisible()
    await expect(page.getByText('新規ページ SEO 追加')).toBeVisible()
    await expect(page.getByText('登録済みページ')).toBeVisible()
  })

  test('AC-DAS09 Audit (/dashboard/admin/audit)', async ({ page }) => {
    await page.goto('/dashboard/admin/audit')
    await expect(page.getByRole('heading', { name: '監査ログ' })).toBeVisible()
    // empty state 許容
  })

  test('AC-DAS10 Health (/dashboard/admin/health)', async ({ page }) => {
    await page.goto('/dashboard/admin/health')
    await expect(page.getByRole('heading', { name: 'システムヘルス' })).toBeVisible()
    await expect(page.getByText('環境チェック')).toBeVisible()
    await expect(page.getByText('テーブル件数')).toBeVisible()
  })

  test('AC-DAS11 Landing (/dashboard/admin/landing)', async ({ page }) => {
    await page.goto('/dashboard/admin/landing')
    await expect(page.getByRole('heading', { name: 'ランディング編集' })).toBeVisible()
    // セクション追加 or 公開履歴 が表示される
    const editorSection = page.getByText(/セクション追加|公開履歴/)
    await expect(editorSection.first()).toBeVisible()
  })

  test('AC-DAS12 Settings (/dashboard/admin/settings)', async ({ page }) => {
    await page.goto('/dashboard/admin/settings')
    await expect(page.getByRole('heading', { name: '設定' })).toBeVisible()
    await expect(page.getByText('Gemini Banana Pro (画像生成)')).toBeVisible()
  })

  test('AC-DAS13 Images (/dashboard/admin/images)', async ({ page }) => {
    await page.goto('/dashboard/admin/images')
    await expect(page.getByRole('heading', { name: '画像ライブラリ' })).toBeVisible()
    // empty state 許容
  })
})

test.describe('Auth - Admin sub-pages access control (non-admin)', () => {
  test('non-admin (client) は /dashboard/admin/users にアクセス時 redirect/403', async ({ page }) => {
    await loginAs(page, 'client')
    const response = await page.goto('/dashboard/admin/users')
    expect(response?.status() ?? 200).toBeLessThan(500)
    // h1「ユーザー管理」が見えないこと
    await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toBeHidden({ timeout: 3000 })
  })

  test('non-admin (counselor) は /dashboard/admin/bookings にアクセス時 redirect/403', async ({ page }) => {
    await loginAs(page, 'counselor')
    const response = await page.goto('/dashboard/admin/bookings')
    expect(response?.status() ?? 200).toBeLessThan(500)
    await expect(page.getByRole('heading', { name: '予約管理' })).toBeHidden({ timeout: 3000 })
  })
})
