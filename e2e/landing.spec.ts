import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('displays hero section with correct heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('カウンセラー')
    await expect(page.getByText('ホリスティック心理学').first()).toBeVisible()
  })

  test('displays feature cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('ホリスティックアプローチ')).toBeVisible()
    await expect(page.getByText('AIマッチング')).toBeVisible()
    await expect(page.getByText('安心・安全')).toBeVisible()
  })

  test('displays how it works section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('ご利用の流れ')).toBeVisible()
    await expect(page.getByText('無料登録').first()).toBeVisible()
  })

  test('has working CTA buttons', async ({ page }) => {
    await page.goto('/')
    const ctaButton = page.getByRole('link', { name: 'カウンセラーを探す' }).first()
    await expect(ctaButton).toBeVisible()
    await expect(ctaButton).toHaveAttribute('href', '/counselors')
  })

  test('has correct page title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/カウンセラーマッチ/)
  })
})
