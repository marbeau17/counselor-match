import { test, expect } from '@playwright/test'

test.describe('About Page', () => {
  test('displays about page content', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('h1', { hasText: '私たちについて' })).toBeVisible()
    await expect(page.getByText('合同会社AICREO NEXT').first()).toBeVisible()
  })

  test('displays holistic psychology section', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByText('ホリスティック心理学').first()).toBeVisible()
    await expect(page.getByText('Body（身体）')).toBeVisible()
    await expect(page.getByText('Mind（思考）')).toBeVisible()
    await expect(page.getByText('Heart（感情）')).toBeVisible()
    await expect(page.getByText('Spirit（魂）')).toBeVisible()
  })

  test('displays soul mirror methodology', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByText('魂鏡の法則').first()).toBeVisible()
    await expect(page.getByText('小林由起子').first()).toBeVisible()
  })

  test('displays company information', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByText('運営会社')).toBeVisible()
    await expect(page.getByText('小林由起子').first()).toBeVisible()
  })

  test('has CTA link to counselors', async ({ page }) => {
    await page.goto('/about')
    const cta = page.getByRole('link', { name: 'カウンセラーを探す' }).first()
    await expect(cta).toBeVisible()
  })
})
