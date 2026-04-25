import { test, expect } from '@playwright/test'

test.describe('Counselors Page', () => {
  test('displays page heading', async ({ page }) => {
    await page.goto('/counselors')
    await expect(page.getByRole('heading', { name: /カウンセラー/ })).toBeVisible()
  })

  test('displays filter sidebar', async ({ page }) => {
    await page.goto('/counselors')
    await expect(page.getByText('悩みで絞り込む')).toBeVisible()
    await expect(page.getByText('アプローチで絞り込む')).toBeVisible()
  })

  test('displays concern filter checkboxes', async ({ page }) => {
    await page.goto('/counselors')
    await expect(page.getByText('恋愛・パートナーシップ').first()).toBeVisible()
    await expect(page.getByText('家族・人間関係').first()).toBeVisible()
  })

  test('has search input', async ({ page }) => {
    await page.goto('/counselors')
    await expect(page.getByPlaceholder('名前・自己紹介...')).toBeVisible()
  })
})
