import { test, expect } from '@playwright/test'
import { loginAs } from './_auth'
import { dbQuery } from './_db'

test.describe('Auth - Counselor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'counselor')
  })

  test('AC-DCO01: h1「カウンセラーダッシュボード」+ 4 枚 Stat Card', async ({ page }) => {
    await page.goto('/dashboard/counselor')
    await expect(page.getByRole('heading', { name: 'カウンセラーダッシュボード' })).toBeVisible()
    await expect(page.getByText('承認待ち').first()).toBeVisible()
    await expect(page.getByText('予約確定').first()).toBeVisible()
    await expect(page.getByText('総セッション').first()).toBeVisible()
    await expect(page.getByText('総収益').first()).toBeVisible()
  })

  test('AC-DCO02: 承認待ち row に Btn「承認」「辞退」', async ({ page }) => {
    await page.goto('/dashboard/counselor')
    // seed で pending 1 件あるので、承認待ちの予約 Card が表示される
    await expect(page.getByText('承認待ちの予約')).toBeVisible()
    await expect(page.getByRole('button', { name: '承認' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: '辞退' }).first()).toBeVisible()
  })

  test('AC-DCO03: availability page (radio 3択 + checkbox + input + 保存 Btn)', async ({ page }) => {
    await page.goto('/dashboard/counselor/availability')
    // radio 3 択
    await expect(page.getByText('オフライン').first()).toBeVisible()
    await expect(page.getByText('予約受付中').first()).toBeVisible()
    await expect(page.getByText('待機中').first()).toBeVisible()
    // checkbox / input / 保存 Btn
    await expect(page.getByText(/オンデマンド通話/)).toBeVisible()
    await expect(page.getByRole('button', { name: '保存' })).toBeVisible()
  })

  test('AC-DCO04: 待機中 Radio + Checkbox + Input + 保存 → 「保存しました」表示 + DB 反映', async ({ page }) => {
    await page.goto('/dashboard/counselor/availability')
    // 待機中 Radio をクリック
    await page.getByLabel('待機中', { exact: false }).click().catch(async () => {
      await page.locator('input[type="radio"][value="machiuke"]').click()
    })
    // Checkbox オン
    const checkbox = page.locator('input[type="checkbox"]').first()
    if (!(await checkbox.isChecked())) {
      await checkbox.click()
    }
    // Input に分単価 ¥500
    const priceInput = page.locator('input[type="number"]').first()
    if (await priceInput.isVisible()) {
      await priceInput.fill('500')
    }
    // 保存
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByText('保存しました')).toBeVisible({ timeout: 10000 })

    // DB に反映されているか直接検証
    const row = dbQuery(
      `SELECT availability_mode || '|' || on_demand_enabled || '|' || COALESCE(price_per_minute::text,'NULL') FROM counselors WHERE id = 'e2ec0000-0000-0000-0000-000000000001'`
    )
    expect(row).toBe('machiuke|true|500')
  })
})
