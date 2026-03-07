import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test.describe.configure({ mode: 'serial' })

  test('1. Homepage is accessible and renders', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('body')).not.toBeEmpty()
    await expect(page.getByText('カウンセラーマッチ').first()).toBeVisible()
  })

  test('2. All main routes return 200', async ({ page }) => {
    const routes = ['/', '/about', '/counselors', '/login', '/register']
    for (const route of routes) {
      const response = await page.goto(route)
      expect(response?.status(), `Route ${route} failed`).toBe(200)
    }
  })

  test('3. Header and footer present on all pages', async ({ page }) => {
    const routes = ['/', '/about', '/counselors', '/login', '/register']
    for (const route of routes) {
      await page.goto(route)
      // Header
      await expect(page.locator('header')).toBeVisible()
      // Footer
      await expect(page.locator('footer')).toBeVisible()
    }
  })

  test('4. Critical CSS and styles load', async ({ page }) => {
    await page.goto('/')
    // Check that Tailwind styles are applied (body should have font)
    const bodyFont = await page.locator('body').evaluate(el =>
      window.getComputedStyle(el).fontFamily
    )
    expect(bodyFont).toBeTruthy()
    expect(bodyFont).not.toBe('')
  })

  test('5. JavaScript loads and hydrates', async ({ page }) => {
    await page.goto('/login')
    // Login page is a client component - try interacting
    const emailInput = page.getByLabel('メールアドレス')
    await emailInput.fill('test@test.com')
    await expect(emailInput).toHaveValue('test@test.com')
  })

  test('6. Images and icons render', async ({ page }) => {
    await page.goto('/')
    // Check that SVG icons render (lucide-react)
    const svgs = page.locator('svg')
    const svgCount = await svgs.count()
    expect(svgCount).toBeGreaterThan(0)
  })

  test('7. Responsive design works', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.getByText('カウンセラーマッチ').first()).toBeVisible()

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText('カウンセラーマッチ').first()).toBeVisible()

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('カウンセラーマッチ').first()).toBeVisible()
  })

  test('8. SEO meta tags present', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toContain('カウンセラーマッチ')

    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(10)
  })

  test('9. No critical JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))

    await page.goto('/')
    await page.goto('/about')
    await page.goto('/login')

    expect(errors).toHaveLength(0)
  })

  test('10. API endpoints respond', async ({ request }) => {
    // Webhook endpoint should return 400 (no signature) not 500
    const stripeResponse = await request.post('/api/webhooks/stripe', {
      data: '{}',
      headers: { 'stripe-signature': 'test' },
    })
    // Should not be a server error (500) - may return 400 (invalid signature) or 200
    expect(stripeResponse.status()).not.toBe(500)
  })
})
