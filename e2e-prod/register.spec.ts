import { test, expect, type Locator } from '@playwright/test'

async function safeFill(locator: Locator, value: string) {
  await locator.waitFor({ state: 'visible' })
  await locator.click()
  await locator.fill(value)
  await expect(locator).toHaveValue(value, { timeout: 5000 })
}

test.describe('PROD - Register page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('PROD-RP01: HTTPS 200 で表示される', async ({ page }) => {
    expect(page.url()).toMatch(/^https:\/\//)
    expect(page.url()).toContain('/register')
  })

  test('PROD-RP02: タイトル + 説明', async ({ page }) => {
    await expect(page.locator('.text-2xl', { hasText: '新規登録' })).toBeVisible()
    await expect(page.getByText('アカウントを作成して始めましょう')).toBeVisible()
  })

  test('PROD-RP03: 必須フィールド (お名前 / Email / Password / Btn)', async ({ page }) => {
    const name = page.getByLabel('お名前')
    const email = page.getByLabel('メールアドレス')
    const password = page.getByLabel('パスワード')
    const submit = page.locator('form button[type="submit"]', { hasText: '無料登録' })

    await expect(name).toBeVisible()
    await expect(name).toHaveAttribute('required', '')

    await expect(email).toBeVisible()
    await expect(email).toHaveAttribute('type', 'email')
    await expect(email).toHaveAttribute('required', '')

    await expect(password).toBeVisible()
    await expect(password).toHaveAttribute('type', 'password')
    await expect(password).toHaveAttribute('required', '')
    await expect(password).toHaveAttribute('minlength', '8')
    await expect(password).toHaveAttribute('placeholder', '8文字以上')

    await expect(submit).toBeVisible()
    await expect(submit).toBeEnabled()
  })

  test('PROD-RP04: ログインページへのリンク (/login)', async ({ page }) => {
    const link = page.getByRole('link', { name: 'ログイン' }).first()
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/login')
  })

  test('PROD-RP05: ログインリンククリックで /login へ遷移', async ({ page }) => {
    await page.getByRole('link', { name: 'ログイン' }).first().click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('PROD-RP06: HTML5 validation - 空フォーム送信ブロック', async ({ page }) => {
    await page.locator('form button[type="submit"]').click()
    // ブラウザの HTML5 validation で送信されず /register に留まる
    await expect(page).toHaveURL(/\/register/)
  })

  test('PROD-RP07: HTML5 validation - 8文字未満パスワード拒否', async ({ page }) => {
    await safeFill(page.getByLabel('お名前'), 'テスト太郎')
    await safeFill(page.getByLabel('メールアドレス'), 'test@example.com')
    await safeFill(page.getByLabel('パスワード'), 'short')
    await page.locator('form button[type="submit"]').click()
    // minlength 制約により送信されず /register に留まる
    await expect(page).toHaveURL(/\/register/)
  })

  // 注: 実際の signup 試験は本番 DB を mutation するためスキップ
  // 既存テストアカウントでの検証は別途認証付き spec で行う想定
  test.skip('PROD-RP08 (skipped): 実際の signup フロー', () => {
    // 本番 DB へのアカウント作成は意図的にスキップ。
    // QA は既知の test メールアドレスで手動確認するか、
    // staging 環境での検証に委譲する。
  })
})
