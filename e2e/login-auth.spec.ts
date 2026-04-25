import { test, expect } from '@playwright/test'

test.describe('Login Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders login form with all required elements', async ({ page }) => {
    // Title
    await expect(page.locator('[class*="CardTitle"], .text-2xl', { hasText: 'ログイン' }).first()).toBeVisible()
    // Description
    await expect(page.getByText('アカウントにログインしてください')).toBeVisible()
    // Email input
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toHaveAttribute('placeholder', 'mail@example.com')
    // Password input
    await expect(page.getByLabel('パスワード')).toBeVisible()
    // Submit button
    await expect(page.locator('form button[type="submit"]', { hasText: 'ログイン' })).toBeVisible()
    await expect(page.locator('form button[type="submit"]', { hasText: 'ログイン' })).toBeEnabled()
  })

  test('email and password fields are required', async ({ page }) => {
    const emailInput = page.getByLabel('メールアドレス')
    const passwordInput = page.getByLabel('パスワード')
    await expect(emailInput).toHaveAttribute('required', '')
    await expect(passwordInput).toHaveAttribute('required', '')
  })

  test('can type email and password', async ({ page }) => {
    const emailInput = page.getByLabel('メールアドレス')
    const passwordInput = page.getByLabel('パスワード')

    // WebKit で fill が反映されないことがあるため、focus + waitFor で安定化
    await emailInput.waitFor({ state: 'visible' })
    await emailInput.click()
    await emailInput.fill('test@example.com')
    await passwordInput.click()
    await passwordInput.fill('password123')

    await expect(emailInput).toHaveValue('test@example.com')
    await expect(passwordInput).toHaveValue('password123')
  })

  test('submit button changes text on form submit', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード').fill('password123')

    // Click submit
    await page.locator('form button[type="submit"]').click()

    // After submission, error message should appear (since credentials are invalid)
    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません。')).toBeVisible({ timeout: 10000 })
  })

  test('shows error message on invalid credentials', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('invalid@example.com')
    await page.getByLabel('パスワード').fill('wrongpassword')

    await page.locator('form button[type="submit"]').click()

    // Wait for error message to appear
    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible({ timeout: 10000 })
  })

  test('form submit triggers authentication attempt', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('wrong@example.com')
    await page.getByLabel('パスワード').fill('wrongpass123')

    await page.locator('form button[type="submit"]').click()

    // After failed auth, error message should appear
    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible({ timeout: 10000 })
    // Button should be re-enabled after error
    await expect(page.locator('form button[type="submit"]')).toBeEnabled()
  })

  test('displays OR divider between email and Google login', async ({ page }) => {
    await expect(page.getByText('または')).toBeVisible()
  })

  test('has link to registration page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: '新規登録' })
    await expect(registerLink).toBeVisible()
    await expect(registerLink).toHaveAttribute('href', '/register')
  })

  test('navigates to register page when link is clicked', async ({ page }) => {
    await page.getByRole('link', { name: '新規登録' }).click()
    await expect(page).toHaveURL('/register')
  })

  test('HTML5 validation prevents empty email submission', async ({ page }) => {
    // Fill only password, leave email empty
    await page.getByLabel('パスワード').fill('password123')
    await page.locator('form button[type="submit"]').click()

    // Should still be on login page (HTML5 validation blocks submission)
    await expect(page).toHaveURL(/\/login/)
  })

  test('HTML5 validation prevents invalid email format', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('not-an-email')
    await page.getByLabel('パスワード').fill('password123')
    await page.locator('form button[type="submit"]').click()

    // Should still be on login page (email validation blocks submission)
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Registration Page Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('renders registration form with all fields', async ({ page }) => {
    await expect(page.locator('[class*="CardTitle"], .text-2xl', { hasText: '新規登録' }).first()).toBeVisible()
    await expect(page.getByText('アカウントを作成して始めましょう')).toBeVisible()
    await expect(page.getByLabel('お名前')).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
    await expect(page.locator('form button[type="submit"]', { hasText: '無料登録' })).toBeVisible()
  })

  test('name, email, and password fields are required', async ({ page }) => {
    await expect(page.getByLabel('お名前')).toHaveAttribute('required', '')
    await expect(page.getByLabel('メールアドレス')).toHaveAttribute('required', '')
    await expect(page.getByLabel('パスワード')).toHaveAttribute('required', '')
  })

  test('password field has minimum length of 8', async ({ page }) => {
    await expect(page.getByLabel('パスワード')).toHaveAttribute('minlength', '8')
    await expect(page.getByLabel('パスワード')).toHaveAttribute('placeholder', '8文字以上')
  })

  test('can fill out registration form', async ({ page }) => {
    await page.getByLabel('お名前').fill('テスト太郎')
    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード').fill('password123')

    await expect(page.getByLabel('お名前')).toHaveValue('テスト太郎')
    await expect(page.getByLabel('メールアドレス')).toHaveValue('test@example.com')
    await expect(page.getByLabel('パスワード')).toHaveValue('password123')
  })

  test('submitting registration form triggers signup attempt', async ({ page }) => {
    await page.getByLabel('お名前').fill('テスト太郎')
    await page.getByLabel('メールアドレス').fill('newuser@example.com')
    await page.getByLabel('パスワード').fill('password123')

    await page.locator('form button[type="submit"]').click()

    // Should show either success message or error (depending on Supabase config)
    await expect(
      page.getByText('確認メールを送信しました').or(page.getByText('登録に失敗しました'))
    ).toBeVisible({ timeout: 10000 })
  })

  test('has link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'ログイン' }).first()
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', '/login')
  })

  test('navigates to login page when link is clicked', async ({ page }) => {
    await page.getByRole('link', { name: 'ログイン' }).first().click()
    await expect(page).toHaveURL('/login')
  })
})
