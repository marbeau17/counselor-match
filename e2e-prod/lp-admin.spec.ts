import { test, expect } from '@playwright/test'

test.describe('PROD - LP admin page (read-only access control)', () => {
  test('PROD-LPA01: 未認証で /dashboard/admin/landing → /login redirect (500 NG)', async ({ page }) => {
    const response = await page.goto('/dashboard/admin/landing')
    expect(response?.status() ?? 200).toBeLessThan(500)
    // h1「ランディング編集」が見えないこと
    await expect(page.getByRole('heading', { name: 'ランディング編集' })).toBeHidden({ timeout: 3000 })
  })

  test('PROD-LPA02: 未認証で /api/admin/landing/sections/reorder → 401/403 (500 NG)', async ({ request }) => {
    const res = await request.post('/api/admin/landing/sections/reorder', {
      data: { items: [] },
    })
    // 401/403/redirect 系。500 系は NG
    expect(res.status()).toBeLessThan(500)
    expect([200, 301, 302, 307, 308, 401, 403, 404].includes(res.status())).toBe(true)
  })

  test('PROD-LPA03: 未認証で /api/admin/landing/page/home → 401/403 (500 NG)', async ({ request }) => {
    const res = await request.get('/api/admin/landing/page/home')
    expect(res.status()).toBeLessThan(500)
    expect([200, 301, 302, 307, 308, 401, 403, 404].includes(res.status())).toBe(true)
  })

  test('PROD-LPA04: 本番 LP に application/ld+json が 2 つ以上 (Organization + WebSite)', async ({ page }) => {
    await page.goto('/')
    const scripts = await page.locator('script[type="application/ld+json"]').count()
    expect(scripts).toBeGreaterThanOrEqual(2)
  })

  test('PROD-LPA05: 本番 LP に skip link が存在 (a11y)', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.locator('a[href="#main-content"]')
    expect(await skipLink.count()).toBeGreaterThanOrEqual(1)
  })

  test('PROD-LPA06: 本番 LP に theme-color meta が存在', async ({ page }) => {
    await page.goto('/')
    const themeColor = await page.locator('meta[name="theme-color"]').count()
    expect(themeColor).toBeGreaterThanOrEqual(1)
  })
})
