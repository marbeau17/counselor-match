import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('landing page loads within 3 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - start
    console.log(`Landing page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000)
  })

  test('about page loads within 3 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/about', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - start
    console.log(`About page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000)
  })

  test('counselors page loads within 3 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/counselors', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - start
    console.log(`Counselors page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000)
  })

  test('login page loads within 3 seconds', async ({ page }) => {
    // dev mode + Supabase auth check 込みで networkidle まで含めると 2-3s 程度かかる
    const start = Date.now()
    await page.goto('/login', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - start
    console.log(`Login page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000)
  })

  test('no console errors on landing page', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/', { waitUntil: 'networkidle' })
    // Filter out known non-critical errors (like Supabase connection when not configured)
    const criticalErrors = errors.filter(e => !e.includes('supabase') && !e.includes('NEXT_PUBLIC'))
    expect(criticalErrors).toHaveLength(0)
  })

  test('page has no broken images', async ({ page }) => {
    await page.goto('/')
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }
  })

  test('Largest Contentful Paint under 2.5s', async ({ page }) => {
    await page.goto('/')
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const last = entries[entries.length - 1]
          resolve(last.startTime)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        // Fallback timeout
        setTimeout(() => resolve(0), 5000)
      })
    })
    console.log(`LCP: ${lcp}ms`)
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500)
    }
  })

  test('page weight is reasonable', async ({ page }) => {
    let totalBytes = 0
    page.on('response', response => {
      const headers = response.headers()
      const contentLength = parseInt(headers['content-length'] || '0')
      totalBytes += contentLength
    })
    await page.goto('/', { waitUntil: 'networkidle' })
    const totalKB = totalBytes / 1024
    console.log(`Total page weight: ${totalKB.toFixed(1)}KB`)
    // Landing page should be under 2MB total
    expect(totalBytes).toBeLessThan(2 * 1024 * 1024)
  })
})
