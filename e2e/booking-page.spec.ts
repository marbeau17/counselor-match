import { test, expect } from '@playwright/test'

const counselorId = 'c0000000-0000-0000-0000-000000000001' // 田中美咲

test.describe('Booking Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/booking/${counselorId}`)
  })

  test('displays booking page with counselor info', async ({ page }) => {
    await expect(page.locator('h1', { hasText: '予約する' })).toBeVisible()
    await expect(page.getByText('田中美咲').first()).toBeVisible()
    await expect(page.getByText('予約内容')).toBeVisible()
  })

  test('displays back link to counselor detail', async ({ page }) => {
    const backLink = page.getByRole('link', { name: 'カウンセラー詳細に戻る' })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', `/counselors/${counselorId}`)
  })

  test('displays session type selection', async ({ page }) => {
    const form = page.locator('form')
    await expect(form.getByText('セッション形式')).toBeVisible()
    await expect(form.getByText('オンライン（ビデオ）')).toBeVisible()
    await expect(page.getByText('チャット').first()).toBeVisible()
    await expect(page.getByText('電話').first()).toBeVisible()
  })

  test('can select different session types', async ({ page }) => {
    const chatButton = page.getByText('チャット').first()
    await chatButton.click()
    // Sidebar should reflect selection
    const sidebar = page.locator('.sticky')
    await expect(sidebar.getByText('チャット')).toBeVisible()
  })

  test('displays date input', async ({ page }) => {
    const form = page.locator('form')
    await expect(form.getByText('日付')).toBeVisible()
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput).toBeVisible()
  })

  test('displays time selection', async ({ page }) => {
    const form = page.locator('form')
    await expect(form.getByText('時間', { exact: true })).toBeVisible()
    const timeSelect = page.locator('select#time')
    await expect(timeSelect).toBeVisible()
    // Should have time slots from 9:00 to 20:00
    await expect(page.locator('option', { hasText: '09:00' })).toBeAttached()
    await expect(page.locator('option', { hasText: '20:00' })).toBeAttached()
  })

  test('displays notes textarea', async ({ page }) => {
    await expect(page.getByText('相談内容・メモ（任意）')).toBeVisible()
    const textarea = page.locator('textarea#notes')
    await expect(textarea).toBeVisible()
    await expect(textarea).toHaveAttribute('placeholder', '事前にお伝えしたいことがあればご記入ください')
  })

  test('displays price in sidebar', async ({ page }) => {
    // WebKit と Chromium の Intl.NumberFormat で通貨記号が ¥ と ￥ のいずれか
    await expect(page.getByText(/[¥￥]12,000/).first()).toBeVisible()
    await expect(page.getByText('50分')).toBeVisible()
  })

  test('displays login required notice when not authenticated', async ({ page }) => {
    await expect(page.getByText('予約にはログインが必要です')).toBeVisible()
    await expect(page.getByRole('link', { name: 'ログイン' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: '新規登録' })).toBeVisible()
  })

  test('submit button is disabled when not authenticated', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: '予約を確定する' })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeDisabled()
  })

  test('sidebar updates when form fields change', async ({ page }) => {
    const sidebar = page.locator('.sticky')

    // Initial state shows "未選択"
    await expect(sidebar.getByText('未選択').first()).toBeVisible()

    // Select date
    const dateInput = page.locator('input[type="date"]')
    await dateInput.fill('2026-04-15')
    await expect(sidebar.getByText('2026-04-15')).toBeVisible()

    // Select time
    const timeSelect = page.locator('select#time')
    await timeSelect.selectOption('10:00')
    await expect(sidebar.getByText('10:00')).toBeVisible()
  })

  test('can fill out booking form completely', async ({ page }) => {
    // Select session type
    await page.getByText('チャット').first().click()

    // Fill date
    await page.locator('input[type="date"]').fill('2026-04-20')

    // Select time
    await page.locator('select#time').selectOption('14:00')

    // Add notes
    await page.locator('textarea#notes').fill('テスト予約のメモです')

    // Verify sidebar reflects selections
    const sidebar = page.locator('.sticky')
    await expect(sidebar.getByText('チャット')).toBeVisible()
    await expect(sidebar.getByText('2026-04-20')).toBeVisible()
    await expect(sidebar.getByText('14:00')).toBeVisible()
  })

  test('non-existent counselor shows not found message', async ({ page }) => {
    await page.goto('/booking/nonexistent-id-999')
    await expect(page.getByText('カウンセラーが見つかりません')).toBeVisible()
    await expect(page.getByRole('link', { name: 'カウンセラー一覧へ戻る' })).toBeVisible()
  })
})

test.describe('Booking Page - Full Navigation Flow', () => {
  test('counselor detail → booking page → back to detail', async ({ page }) => {
    // Start at counselor detail
    await page.goto(`/counselors/${counselorId}`)
    await expect(page.locator('h1', { hasText: '田中美咲' })).toBeVisible()

    // Click booking CTA
    await page.getByRole('link', { name: '予約に進む' }).click()
    await expect(page).toHaveURL(`/booking/${counselorId}`)
    await expect(page.locator('h1', { hasText: '予約する' })).toBeVisible()

    // Go back
    await page.getByRole('link', { name: 'カウンセラー詳細に戻る' }).click()
    await expect(page).toHaveURL(`/counselors/${counselorId}`)
  })

  test('booking page for different counselors shows correct data', async ({ page }) => {
    // 鈴木健太
    await page.goto('/booking/c0000000-0000-0000-0000-000000000002')
    await expect(page.getByText('鈴木健太').first()).toBeVisible()
    await expect(page.getByText(/[¥￥]9,000/).first()).toBeVisible()

    // 中村彩花
    await page.goto('/booking/c0000000-0000-0000-0000-000000000005')
    await expect(page.getByText('中村彩花').first()).toBeVisible()
    await expect(page.getByText(/[¥￥]5,000/).first()).toBeVisible()
  })
})
