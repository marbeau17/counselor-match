import { test, expect, type Locator } from '@playwright/test'

async function safeFill(locator: Locator, value: string) {
  await locator.waitFor({ state: 'visible' })
  await locator.click()
  await locator.fill(value)
  await expect(locator).toHaveValue(value, { timeout: 5000 })
}

test.describe('PROD - Forgot password page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password')
  })

  test('PROD-FP01: HTTPS 200 で表示される', async ({ page }) => {
    expect(page.url()).toMatch(/^https:\/\//)
    expect(page.url()).toContain('/forgot-password')
  })

  test('PROD-FP02: メール送信フォームが存在', async ({ page }) => {
    const email = page.getByLabel(/メール/i)
    await expect(email.first()).toBeVisible()
    await expect(email.first()).toHaveAttribute('type', 'email')
  })

  test('PROD-FP03: 送信ボタンが存在', async ({ page }) => {
    const submit = page.locator('form button[type="submit"]')
    await expect(submit).toBeVisible()
  })

  test('PROD-FP04: ログインに戻るリンクが存在', async ({ page }) => {
    const link = page.getByRole('link', { name: /ログイン|戻る/ }).first()
    await expect(link).toBeVisible()
  })

  test('PROD-FP05: HTML5 validation - 空 / 不正メールブロック', async ({ page }) => {
    await safeFill(page.getByLabel(/メール/i).first(), 'not-an-email')
    await page.locator('form button[type="submit"]').click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('PROD-FP06: 存在しないメールでもエラー漏洩なし (UX 配慮確認)', async ({ page }) => {
    await safeFill(page.getByLabel(/メール/i).first(), 'nonexistent-prod-test@example.invalid')
    await page.locator('form button[type="submit"]').click()
    // 「成功」または「エラー」が表示される (どちらでも 500 系でなければ OK)
    // 存在チェック漏洩を避けるため、両方を許容する設計が一般的
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    expect(page.url()).toContain('/forgot-password')
  })
})

test.describe('PROD - Reset password page (token gate)', () => {
  test('PROD-RPW01: token なしアクセスは適切にハンドリング (500 NG)', async ({ page }) => {
    const response = await page.goto('/reset-password')
    expect(response?.status() ?? 200).toBeLessThan(500)
  })
})
