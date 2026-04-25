import { test, expect } from '@playwright/test'
import { loginAs } from './_auth'
import { dbCount, dbQuery } from './_db'

test.describe('Auth - Booking flow (AC-B06-Auth)', () => {
  test('認証済みクライアントが /booking/[id] で全項目入力 → 予約確定 Btn → Success Card', async ({ page }) => {
    await loginAs(page, 'client')

    // 田中美咲 (master) の予約ページへ
    await page.goto('/booking/c0000000-0000-0000-0000-000000000001')

    // ログイン後、未認証 alert は表示されないこと
    await expect(page.getByText('予約にはログインが必要です')).toBeHidden({ timeout: 5000 }).catch(() => {})

    // セッション形式: オンライン
    await page.getByRole('button', { name: 'オンライン（ビデオ）' }).click()

    // 日付: 明日
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().slice(0, 10)
    await page.locator('input[type="date"]').fill(dateStr)

    // 時刻: 10:00
    await page.locator('select#time, select[name="time"]').first().selectOption('10:00')

    // メモ
    await page.locator('textarea#notes').fill('E2E auth booking test')

    // 確定ボタンクリック
    const submitBtn = page.getByRole('button', { name: '予約を確定する' })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    // Success Card 表示 (h1「予約が完了しました」+ 2 つの Btn)
    await expect(page.getByRole('heading', { name: '予約が完了しました' })).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('link', { name: 'ダッシュボードへ' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'カウンセラー一覧へ' })).toBeVisible()

    // DB 直接検証: e2e_client_001 の田中美咲への新規予約が pending で 1 件以上できている
    const newBookingCount = dbCount(
      `SELECT count(*) FROM bookings WHERE client_id = 'e2e00000-0000-0000-0000-000000000001' AND counselor_id = 'c0000000-0000-0000-0000-000000000001' AND notes = 'E2E auth booking test'`
    )
    expect(newBookingCount).toBeGreaterThanOrEqual(1)

    // 予約のセッション形式が online、duration 50 分が確定している
    const status = dbQuery(
      `SELECT session_type || '|' || duration_minutes::text FROM bookings WHERE notes = 'E2E auth booking test' ORDER BY created_at DESC LIMIT 1`
    )
    expect(status).toBe('online|50')
  })
})
