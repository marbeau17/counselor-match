import { test, expect } from '@playwright/test'

test.describe('Landing Page (after redesign)', () => {
  test('displays hero with new positioning copy', async ({ page }) => {
    await page.goto('/')
    // 新 Hero: "「整える」ではなく、「ほどく」時間を。"
    await expect(page.locator('h1')).toContainText(/ほどく/)
  })

  test('displays story narrative section after hero', async ({ page }) => {
    await page.goto('/')
    // Story セクション (Why we exist) — Hero subheadline と story heading の両方に文言あるため first()
    await expect(page.getByText('急かされない場所で').first()).toBeVisible()
    await expect(page.getByText(/Why we exist/i)).toBeVisible()
  })

  test('displays approach section with 3 commitments', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('3 つの、大切にしていること')).toBeVisible()
    await expect(page.getByRole('heading', { name: '聴くこと' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '映すこと' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '守ること' })).toBeVisible()
  })

  test('displays journey (4 steps) section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('対話までの、ゆっくりとした 4 ステップ')).toBeVisible()
    await expect(page.getByText('Step 01')).toBeVisible()
    await expect(page.getByText('Step 04')).toBeVisible()
  })

  test('displays testimonials section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('言葉になった気づきたち')).toBeVisible()
  })

  test('has working CTA button (静かに話せる人を探す)', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /静かに話せる人を探す/ })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', '/counselors')
  })

  test('has correct page title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/カウンセラーマッチ/)
  })

  test('uses serif font for h1 (Noto Serif JP loaded)', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const fontFamily = await page.locator('h1').first().evaluate(el => window.getComputedStyle(el).fontFamily)
    // Noto Serif JP もしくは fallback の serif
    expect(fontFamily.toLowerCase()).toMatch(/serif/)
  })
})
