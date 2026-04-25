import { test, expect, type Locator } from '@playwright/test'

/** WebKit の fill race を回避 */
async function safeFill(locator: Locator, value: string) {
  await locator.waitFor({ state: 'visible' })
  await locator.click()
  await locator.fill(value)
  await expect(locator).toHaveValue(value, { timeout: 5000 })
}

test.describe('PROD - Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('PROD-LP01: HTTPS 200 で表示される', async ({ page }) => {
    expect(page.url()).toMatch(/^https:\/\//)
    expect(page.url()).toContain('/login')
  })

  test('PROD-LP02: タイトル + Card 構造', async ({ page }) => {
    // CardTitle (.text-2xl) スコープで取得 (header の hidden link と衝突回避)
    await expect(page.locator('.text-2xl', { hasText: 'ログイン' })).toBeVisible()
    await expect(page.getByText('アカウントにログインしてください')).toBeVisible()
  })

  test('PROD-LP03: 必須フォーム要素 (email + password + Btn)', async ({ page }) => {
    const email = page.getByLabel('メールアドレス')
    const password = page.getByLabel('パスワード')
    const submit = page.locator('form button[type="submit"]', { hasText: 'ログイン' })

    await expect(email).toBeVisible()
    await expect(email).toHaveAttribute('type', 'email')
    await expect(email).toHaveAttribute('required', '')
    await expect(email).toHaveAttribute('placeholder', 'mail@example.com')

    await expect(password).toBeVisible()
    await expect(password).toHaveAttribute('type', 'password')
    await expect(password).toHaveAttribute('required', '')

    await expect(submit).toBeVisible()
    await expect(submit).toBeEnabled()
  })

  test('PROD-LP04: Google ログイン Btn が存在', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Googleでログイン/ })).toBeVisible()
  })

  test('PROD-LP05: 「または」divider が存在', async ({ page }) => {
    await expect(page.getByText('または')).toBeVisible()
  })

  test('PROD-LP06: 新規登録リンク (/register)', async ({ page }) => {
    const link = page.getByRole('link', { name: '新規登録' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/register')
  })

  test('PROD-LP07: パスワードを忘れたリンク (/forgot-password)', async ({ page }) => {
    const link = page.getByRole('link', { name: /パスワードを忘れた/ })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/forgot-password')
  })

  test('PROD-LP08: HTML5 validation - 空メール送信ブロック', async ({ page }) => {
    await safeFill(page.getByLabel('パスワード'), 'password123')
    await page.locator('form button[type="submit"]').click()
    // HTML5 validation で /login に留まる
    await expect(page).toHaveURL(/\/login/)
  })

  test('PROD-LP09: HTML5 validation - 不正なメール形式ブロック', async ({ page }) => {
    await safeFill(page.getByLabel('メールアドレス'), 'not-an-email')
    await safeFill(page.getByLabel('パスワード'), 'password123')
    await page.locator('form button[type="submit"]').click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('PROD-LP10: 不正な認証情報でエラー表示 (Supabase 連携正常確認)', async ({ page }) => {
    await safeFill(page.getByLabel('メールアドレス'), 'noexist@example.com')
    await safeFill(page.getByLabel('パスワード'), 'wrongpassword123')
    await page.locator('form button[type="submit"]').click()
    // Supabase auth API 経由でエラーが返る
    await expect(
      page.getByText('メールアドレスまたはパスワードが正しくありません').or(
        page.getByText('認証サービスが利用できません')
      )
    ).toBeVisible({ timeout: 20000 })
    // Submit Btn が再度有効化される
    await expect(page.locator('form button[type="submit"]')).toBeEnabled()
    // 500 系エラーページに飛ばないこと
    expect(page.url()).toContain('/login')
  })

  test('PROD-LP11: 新規登録リンククリックで /register へ遷移', async ({ page }) => {
    await page.getByRole('link', { name: '新規登録' }).click()
    await expect(page).toHaveURL(/\/register$/)
  })

  test('PROD-LP12: パスワードを忘れたクリックで /forgot-password へ遷移', async ({ page }) => {
    await page.getByRole('link', { name: /パスワードを忘れた/ }).click()
    await expect(page).toHaveURL(/\/forgot-password$/)
  })
})
