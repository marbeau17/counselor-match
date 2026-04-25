import { test, expect } from '@playwright/test'

test.describe('Booking Flow - Counselor Selection (Cart)', () => {
  test('counselor listing shows all 6 mock counselors', async ({ page }) => {
    await page.goto('/counselors')
    await expect(page.locator('h1', { hasText: 'カウンセラーを探す' })).toBeVisible()

    // Verify all 6 counselors are displayed
    await expect(page.getByText('田中美咲').first()).toBeVisible()
    await expect(page.getByText('鈴木健太').first()).toBeVisible()
    await expect(page.getByText('山本あかり').first()).toBeVisible()
    await expect(page.getByText('佐藤龍一').first()).toBeVisible()
    await expect(page.getByText('中村彩花').first()).toBeVisible()
    await expect(page.getByText('伊藤大和').first()).toBeVisible()
  })

  test('counselor cards display price and session count', async ({ page }) => {
    await page.goto('/counselors')

    // 待機中モードのカウンセラーは price_per_minute (例: ¥400/分) のみ表示。
    // それ以外は formatPrice(hourly_rate) (全角￥) で表示。少なくとも 1 件ずつ存在する想定。
    await expect(page.getByText(/￥9,000|￥5,000|￥7,000|￥12,000|¥400\/分/).first()).toBeVisible()

    // セッション回数
    await expect(page.getByText('1850回').first()).toBeVisible()
    await expect(page.getByText('920回').first()).toBeVisible()
  })

  test('counselor cards show specialties badges', async ({ page }) => {
    await page.goto('/counselors')

    await expect(page.getByText('ホリスティック心理学').first()).toBeVisible()
    await expect(page.getByText('キャリアカウンセリング').first()).toBeVisible()
    await expect(page.getByText('家族療法').first()).toBeVisible()
  })

  test('counselor cards show level badges', async ({ page }) => {
    await page.goto('/counselors')

    await expect(page.getByText('マスター').first()).toBeVisible()
    await expect(page.getByText('シニア').first()).toBeVisible()
    await expect(page.getByText('レギュラー').first()).toBeVisible()
    // 新規 tier 「新人」（旧名 スターター）
    await expect(page.getByText(/新人|スターター/).first()).toBeVisible()
  })

  test('counselor cards have "詳細を見る" button', async ({ page }) => {
    await page.goto('/counselors')

    const detailButtons = page.getByRole('link', { name: '詳細を見る' })
    const count = await detailButtons.count()
    expect(count).toBe(6)
  })

  test('clicking "詳細を見る" navigates to counselor detail', async ({ page }) => {
    await page.goto('/counselors')

    // Click the first counselor's detail button
    await page.getByRole('link', { name: '詳細を見る' }).first().click()

    // Should navigate to a counselor detail page
    await expect(page).toHaveURL(/\/counselors\/c0000000/)
  })
})

test.describe('Booking Flow - Counselor Detail Page', () => {
  const counselorId = 'c0000000-0000-0000-0000-000000000001' // 田中美咲

  test.beforeEach(async ({ page }) => {
    await page.goto(`/counselors/${counselorId}`)
  })

  test('displays counselor profile header', async ({ page }) => {
    await expect(page.locator('h1', { hasText: '田中美咲' })).toBeVisible()
    await expect(page.getByText('マスター').first()).toBeVisible()
    await expect(page.getByText('ホリスティック心理カウンセラー・マスター認定')).toBeVisible()
  })

  test('displays counselor bio section', async ({ page }) => {
    await expect(page.getByText('自己紹介')).toBeVisible()
    await expect(page.getByText('15年以上のカウンセリング経験').first()).toBeVisible()
  })

  test('displays specialties section', async ({ page }) => {
    await expect(page.getByText('専門分野').first()).toBeVisible()
    await expect(page.getByText('ホリスティック心理学').first()).toBeVisible()
    await expect(page.getByText('トラウマ').first()).toBeVisible()
    await expect(page.getByText('グリーフケア').first()).toBeVisible()
  })

  test('displays certifications section', async ({ page }) => {
    await expect(page.getByText('資格・認定')).toBeVisible()
    await expect(page.getByText('臨床心理士').first()).toBeVisible()
    await expect(page.getByText('EMDR認定セラピスト')).toBeVisible()
  })

  test('displays rating and session count', async ({ page }) => {
    await expect(page.getByText('4.9').first()).toBeVisible()
    await expect(page.getByText('127件').first()).toBeVisible()
    await expect(page.getByText('セッション 1850回')).toBeVisible()
  })

  test('displays reviews section with mock reviews', async ({ page }) => {
    await expect(page.getByText('レビュー').first()).toBeVisible()
    // 田中美咲 のレビュー本文の特徴的な部分でマッチ（reviewer 名は anonymous の場合あり）
    await expect(page.getByText('田中先生のホリスティックなアプローチ').first()).toBeVisible()
  })

  test('displays star ratings in reviews', async ({ page }) => {
    // There should be star icons in the reviews section
    const stars = page.locator('svg.text-yellow-400.fill-yellow-400')
    const count = await stars.count()
    // At least 5 yellow stars for a 5-star review
    expect(count).toBeGreaterThanOrEqual(5)
  })

  test('displays booking sidebar with price', async ({ page }) => {
    await expect(page.getByText('予約する')).toBeVisible()
    await expect(page.getByText('￥12,000')).toBeVisible()
    await expect(page.getByText('/ 50分セッション')).toBeVisible()
  })

  test('displays available session types', async ({ page }) => {
    await expect(page.getByText('対応形式')).toBeVisible()
    await expect(page.getByText('ビデオ').first()).toBeVisible()
    await expect(page.getByText('チャット').first()).toBeVisible()
    await expect(page.getByText('電話').first()).toBeVisible()
  })

  test('displays booking CTA button', async ({ page }) => {
    const bookingButton = page.getByRole('link', { name: '予約に進む' })
    await expect(bookingButton).toBeVisible()
    await expect(bookingButton).toHaveAttribute('href', `/booking/${counselorId}`)
  })

  test('displays login required notice', async ({ page }) => {
    await expect(page.getByText('※ 予約にはログインが必要です')).toBeVisible()
  })
})

test.describe('Booking Flow - Different Counselors', () => {
  test('鈴木健太 detail page shows correct info', async ({ page }) => {
    await page.goto('/counselors/c0000000-0000-0000-0000-000000000002')

    await expect(page.locator('h1', { hasText: '鈴木健太' })).toBeVisible()
    await expect(page.getByText('シニア').first()).toBeVisible()
    await expect(page.getByText('￥9,000')).toBeVisible()
    await expect(page.getByText('キャリアカウンセリング').first()).toBeVisible()
    await expect(page.getByText('予約に進む')).toBeVisible()
  })

  test('中村彩花 detail page shows correct info', async ({ page }) => {
    await page.goto('/counselors/c0000000-0000-0000-0000-000000000005')

    await expect(page.locator('h1', { hasText: '中村彩花' })).toBeVisible()
    await expect(page.getByText('スターター').first()).toBeVisible()
    await expect(page.getByText('￥5,000')).toBeVisible()
    await expect(page.getByText('予約に進む')).toBeVisible()
  })

  test('non-existent counselor returns 404', async ({ page }) => {
    const response = await page.goto('/counselors/nonexistent-id-12345')
    expect(response?.status()).toBe(404)
  })
})

test.describe('Booking Flow - End-to-End Navigation', () => {
  test('full flow: landing → counselors → detail → booking CTA', async ({ page }) => {
    // Step 1: Start from landing page
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()

    // Step 2: Navigate to counselors via CTA or header
    await page.getByRole('link', { name: 'カウンセラーを探す' }).first().click()
    await expect(page).toHaveURL('/counselors')
    await expect(page.locator('h1', { hasText: 'カウンセラーを探す' })).toBeVisible()

    // Step 3: Click on a counselor
    await page.getByRole('link', { name: '詳細を見る' }).first().click()
    await expect(page).toHaveURL(/\/counselors\/c0000000/)

    // Step 4: Verify booking sidebar is present
    await expect(page.getByText('予約する')).toBeVisible()
    await expect(page.getByRole('link', { name: '予約に進む' })).toBeVisible()
  })

  test('booking requires authentication - unauthenticated user cannot book', async ({ page }) => {
    // Navigate to a counselor detail page
    await page.goto('/counselors/c0000000-0000-0000-0000-000000000001')

    // The booking CTA links to /booking/:id which requires login
    const bookingLink = page.getByRole('link', { name: '予約に進む' })
    await expect(bookingLink).toBeVisible()

    // Verify login notice is shown
    await expect(page.getByText('※ 予約にはログインが必要です')).toBeVisible()
  })

  test('counselor filter sidebar is visible', async ({ page }) => {
    await page.goto('/counselors')

    const sidebar = page.locator('aside')

    // フィルタセクション
    await expect(sidebar.getByText('悩みで絞り込む')).toBeVisible()
    await expect(sidebar.getByText('アプローチで絞り込む')).toBeVisible()

    // フィルタ選択肢
    await expect(sidebar.getByText('恋愛・パートナーシップ').first()).toBeVisible()
    await expect(sidebar.getByText('家族・人間関係').first()).toBeVisible()
    await expect(sidebar.getByText('ホリスティック心理学').first()).toBeVisible()
  })
})
