import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('header displays brand and nav links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('カウンセラーマッチ').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'カウンセラーを探す' }).first()).toBeVisible()
  })

  test('navigates to counselors page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'カウンセラーを探す' }).first().click()
    await expect(page).toHaveURL('/counselors')
    await expect(page.getByRole('heading', { name: 'カウンセラーを探す' })).toBeVisible()
  })

  test('navigates to about page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: '私たちについて' }).first().click()
    await expect(page).toHaveURL('/about')
    await expect(page.getByRole('heading', { name: '私たちについて' })).toBeVisible()
  })

  test('navigates to login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'ログイン' }).first().click()
    await expect(page).toHaveURL('/login')
  })

  test('navigates to register page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: '無料登録' }).first().click()
    await expect(page).toHaveURL('/register')
  })

  test('footer has legal links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: '利用規約' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'プライバシーポリシー' })).toBeVisible()
  })
})
