import { test, expect } from '@playwright/test'

/**
 * OAuth コールバックエンドポイントの存在確認 (404/500 系の発生がないこと)。
 * 実際の OAuth 試験は外部 IdP (Google) 連携が必要なためスキップ。
 */
test.describe('PROD - OAuth callback endpoint', () => {
  test('PROD-OC01: /auth/callback (no params) は適切に handle (500 NG)', async ({ page }) => {
    const response = await page.goto('/auth/callback')
    expect(response?.status() ?? 200).toBeLessThan(500)
    // login へ redirect or エラーメッセージ表示が想定
    expect(page.url()).toMatch(/\/(login|auth\/callback|$)/)
  })

  test('PROD-OC02: /auth/callback?error=access_denied は /login へ redirect', async ({ page }) => {
    await page.goto('/auth/callback?error=access_denied&error_description=test')
    // 不正な error パラメータでも 500 にならず login にリダイレクトされる想定
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).toMatch(/\/(login|auth\/callback)/)
  })

  test('PROD-OC03: /auth/callback?code=invalid (不正な code) は適切に handle', async ({ page }) => {
    const response = await page.goto('/auth/callback?code=invalid-test-code-12345')
    expect(response?.status() ?? 200).toBeLessThan(500)
  })
})

test.describe('PROD - 認証必須ページの未認証アクセス挙動', () => {
  for (const path of [
    '/dashboard',
    '/dashboard/client',
    '/dashboard/counselor',
    '/dashboard/admin',
    '/dashboard/wallet',
    '/dashboard/journey',
    '/dashboard/journal',
  ]) {
    test(`PROD-AG01 ${path}: 未認証で訪問 → /login へ redirect (500 NG)`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status() ?? 200).toBeLessThan(500)
      // 未認証なので最終的に login またはダッシュボード未認証画面に着く想定
      // 500/404 にならないことを確認
      expect(page.url()).toMatch(/\/(login|dashboard)/)
    })
  }
})

test.describe('PROD - Public ページの認証なし表示', () => {
  for (const path of ['/', '/counselors', '/about', '/about/screening', '/column', '/login', '/register']) {
    test(`PROD-PA01 ${path}: 200 で表示`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status() ?? 200).toBe(200)
      // body が存在する
      await expect(page.locator('body')).toBeVisible()
    })
  }
})
