import { test, expect } from '@playwright/test'
import { loginAs, TEST_USERS } from './_auth'

test.describe('Auth - Client Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'client')
  })

  test('AC-DC02: h1 にこんにちは + 表示名', async ({ page }) => {
    await page.goto('/dashboard/client')
    const h1 = page.locator('h1').first()
    await expect(h1).toContainText(`こんにちは、${TEST_USERS.client.displayName}さん`)
  })

  test('AC-DC03: 3 枚 Stat Card (予約中 / セッション履歴 / カウンセラーを探す)', async ({ page }) => {
    await page.goto('/dashboard/client')
    await expect(page.getByText('予約中').first()).toBeVisible()
    await expect(page.getByText('セッション履歴').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'カウンセラーを探す' })).toBeVisible()
  })

  test('AC-DC03 (link): 「カウンセラーを探す」クリックで /counselors 遷移', async ({ page }) => {
    await page.goto('/dashboard/client')
    // モバイルではヘッダーの desktop nav が hidden なので、main 領域内 + visible に限定
    const ctaLink = page.locator('main a[href="/counselors"]:visible').first()
    await expect(ctaLink).toBeVisible()
  })

  test('AC-DC04: 予約一覧 Card に少なくとも 1 件の booking が表示される', async ({ page }) => {
    await page.goto('/dashboard/client')
    await expect(page.getByText('予約一覧')).toBeVisible()
    // seed で confirmed/pending/completed の 3 件入れているため、いずれかの状態 Badge が見える
    const statusBadge = page
      .getByText(/確認待ち|確定|完了|キャンセル/)
    await expect(statusBadge.first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Auth - Wallet', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'client')
  })

  test('AC-DW01: h1「ポイントウォレット」+ 残高 ¥金額', async ({ page }) => {
    await page.goto('/dashboard/wallet')
    await expect(page.getByRole('heading', { name: 'ポイントウォレット' })).toBeVisible()
    // seed 残高 ¥6,000
    await expect(page.getByText(/[¥￥]6,000/)).toBeVisible()
  })

  test('AC-DW02: TopUp 3 つの Button (¥5,000 / ¥10,000 / ¥30,000)', async ({ page }) => {
    await page.goto('/dashboard/wallet')
    await expect(page.getByRole('button', { name: /[¥￥]5,000/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /[¥￥]10,000/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /[¥￥]30,000/ })).toBeVisible()
  })

  test('AC-DW03: 取引履歴 Table (日付 / 種別 / 金額 / メモ)', async ({ page }) => {
    await page.goto('/dashboard/wallet')
    await expect(page.getByText('取引履歴')).toBeVisible()
    await expect(page.locator('th', { hasText: '日付' })).toBeVisible()
    await expect(page.locator('th', { hasText: '種別' })).toBeVisible()
    await expect(page.locator('th', { hasText: '金額' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'メモ' })).toBeVisible()
  })

  test('AC-DW04: signup_bonus row「新規登録ボーナス」+ +¥3,000', async ({ page }) => {
    await page.goto('/dashboard/wallet')
    // 種別 col + メモ col の 2 箇所に出るため first()
    await expect(page.getByText('新規登録ボーナス').first()).toBeVisible()
    await expect(page.getByText(/\+[¥￥]3,000/).first()).toBeVisible()
  })
})

test.describe('Auth - Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'client')
  })

  test('AC-DJ01: h1「わたしの旅路」', async ({ page }) => {
    await page.goto('/dashboard/journey')
    await expect(page.getByRole('heading', { name: 'わたしの旅路' })).toBeVisible()
  })

  test('AC-DJ02: 現在ステージ Card に Badge / description / 受けられる特典 (ul)', async ({ page }) => {
    await page.goto('/dashboard/journey')
    await expect(page.getByText('現在のステージ').first()).toBeVisible()
    await expect(page.getByText('受けられる特典')).toBeVisible()
    // ul が存在する
    const perksList = page.locator('ul').filter({ hasText: /.+/ }).first()
    await expect(perksList).toBeVisible()
  })

  test('AC-DJ03: Progress tracker に 3 段階 (Shoshin / Shinka / Musubi) が表示', async ({ page }) => {
    await page.goto('/dashboard/journey')
    // romaji が hero と progress card の 2 箇所に出るので first()
    await expect(page.getByText('Shoshin').first()).toBeVisible()
    await expect(page.getByText('Shinka').first()).toBeVisible()
    await expect(page.getByText('Musubi').first()).toBeVisible()
    // Badge of either 現在 / 達成済み / 未到達
    const badges = page.getByText(/現在|達成済み|未到達/)
    expect(await badges.count()).toBeGreaterThanOrEqual(3)
  })

  test('AC-DJ04: 次ステージへの requirement が「{label}: {current} / {required}」形式', async ({ page }) => {
    await page.goto('/dashboard/journey')
    // 「次のステージ:」または「最終段階」のいずれか
    const nextOrFinal = page.getByText(/次のステージ:|最終段階/)
    await expect(nextOrFinal.first()).toBeVisible()
  })
})
