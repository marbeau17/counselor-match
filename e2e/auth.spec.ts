import { test, expect } from '@playwright/test'

test.describe('Authentication Pages', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('[class*="CardTitle"], .text-2xl', { hasText: 'ログイン' }).first()).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
    await expect(page.locator('form button[type="submit"]', { hasText: 'ログイン' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible()
  })

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('[class*="CardTitle"], .text-2xl', { hasText: '新規登録' }).first()).toBeVisible()
    await expect(page.getByLabel('お名前')).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
    await expect(page.locator('form button[type="submit"]', { hasText: '無料登録' })).toBeVisible()
  })

  test('login page has link to register', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: '新規登録' })).toBeVisible()
  })

  test('register page has link to login', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('link', { name: 'ログイン' }).first()).toBeVisible()
  })

  test('login form validates required fields', async ({ page }) => {
    await page.goto('/login')
    await page.locator('form button[type="submit"]', { hasText: 'ログイン' }).click()
    // HTML5 validation prevents submission - email field should be invalid
    const emailInput = page.getByLabel('メールアドレス')
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('register form validates password length hint', async ({ page }) => {
    await page.goto('/register')
    const passwordInput = page.getByLabel('パスワード')
    await expect(passwordInput).toHaveAttribute('placeholder', '8文字以上')
  })
})
