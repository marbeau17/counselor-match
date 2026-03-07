import { test, expect } from '@playwright/test'

test.describe('Counselors Page', () => {
  test('displays page heading', async ({ page }) => {
    await page.goto('/counselors')
    await expect(page.getByRole('heading', { name: 'カウンセラーを探す' })).toBeVisible()
  })

  test('displays filter sidebar', async ({ page }) => {
    await page.goto('/counselors')
    await expect(page.getByText('キーワード検索')).toBeVisible()
    await expect(page.getByText('専門分野')).toBeVisible()
    await expect(page.getByText('セッション形式')).toBeVisible()
  })

  test('displays specialty filter checkboxes', async ({ page }) => {
    await page.goto('/counselors')
    await expect(page.getByText('ストレス・不安')).toBeVisible()
    await expect(page.getByText('人間関係')).toBeVisible()
    await expect(page.getByText('スピリチュアル')).toBeVisible()
  })

  test('has search input', async ({ page }) => {
    await page.goto('/counselors')
    await expect(page.getByPlaceholder('専門分野、名前...')).toBeVisible()
  })
})
