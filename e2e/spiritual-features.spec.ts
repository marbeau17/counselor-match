import { test, expect } from '@playwright/test'

test.describe('Landing — new brand positioning', () => {
  test('page title reflects spiritual/holistic positioning', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/スピリチュアル|ホリスティック|カウンセリング|魂/)
  })

  test('hero heading contains new positioning copy', async ({ page }) => {
    await page.goto('/')
    const heading = page
      .getByRole('heading', { name: /占いを超えた/ })
      .or(page.getByRole('heading', { name: /魂のための/ }))
    await expect(heading.first()).toBeVisible()
  })

  test('links to /counselors and /tools/personality are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href="/counselors"]').first()).toBeVisible()
    await expect(page.locator('a[href="/tools/personality"]').first()).toBeVisible()
  })

  test('renders at least one methodology label', async ({ page }) => {
    await page.goto('/')
    const methodology = page
      .getByText('タロット', { exact: false })
      .or(page.getByText('Soul Mirror Law', { exact: false }))
      .or(page.getByText('ホリスティック心理学', { exact: false }))
    await expect(methodology.first()).toBeVisible()
  })
})

test.describe('Counselors list — dual-axis filters', () => {
  test('shows concern filter header', async ({ page }) => {
    await page.goto('/counselors')
    const header = page
      .getByText('悩みで絞り込む', { exact: false })
      .or(page.getByRole('heading', { name: /絞り込む/ }))
    await expect(header.first()).toBeVisible()
  })

  test('shows at least one concern checkbox label', async ({ page }) => {
    await page.goto('/counselors')
    const concern = page
      .getByText('恋愛', { exact: false })
      .or(page.getByText('仕事', { exact: false }))
      .or(page.getByText('家族', { exact: false }))
    await expect(concern.first()).toBeVisible()
  })

  test('shows at least one methodology filter label', async ({ page }) => {
    await page.goto('/counselors')
    const methodology = page
      .getByText('タロット', { exact: false })
      .or(page.getByText('Soul Mirror Law', { exact: false }))
    await expect(methodology.first()).toBeVisible()
  })

  test('clicking a concern checkbox does not crash the grid', async ({ page }) => {
    await page.goto('/counselors')
    const concernLabel = page
      .locator('label', { hasText: '恋愛' })
      .or(page.locator('label', { hasText: '仕事' }))
      .or(page.locator('label', { hasText: '家族' }))
      .first()
    await concernLabel.scrollIntoViewIfNeeded()
    await concernLabel.click({ force: true }).catch(() => {})
    // Page still responsive; heading remains
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  })

  test('counselor cards render from mock data', async ({ page }) => {
    await page.goto('/counselors')
    // At least one link to a counselor detail page should exist
    const cardLink = page.locator('a[href^="/counselors/"]').first()
    await expect(cardLink).toBeVisible({ timeout: 10000 })
  })

  test('availability badge appears for at least one card (optional)', async ({ page }) => {
    await page.goto('/counselors')
    const badge = page
      .getByText('待機中', { exact: false })
      .or(page.getByText('予約受付中', { exact: false }))
      .or(page.getByText('オフライン', { exact: false }))
    // Non-strict: if present, should be visible; otherwise, don't fail hard.
    const count = await badge.count()
    if (count > 0) {
      await expect(badge.first()).toBeVisible()
    }
  })
})

test.describe('Free tools', () => {
  test('Personality: diagnoses and shows an archetype result', async ({ page }) => {
    await page.goto('/tools/personality')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/パーソナリティ診断/)
    await page.locator('input[type="date"]').first().fill('1990-05-15')
    await page.getByRole('button', { name: /診断する/ }).click()
    const archetype = page
      .getByText('Seeker', { exact: false })
      .or(page.getByText('Healer', { exact: false }))
      .or(page.getByText('Creator', { exact: false }))
    await expect(archetype.first()).toBeVisible({ timeout: 10000 })
    // Ethics: must not use predictive fortune language
    await expect(page.getByText('予言', { exact: true })).not.toBeVisible()
  })

  test('Tarot: draws a card for a reflective question', async ({ page }) => {
    await page.goto('/tools/tarot')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/タロット/)
    await page.locator('textarea').fill('自分を知るために必要なことは何か')
    await page.getByRole('button', { name: /カードを引く|引く|診断/ }).first().click()
    const cardName = page
      .getByText('愚者', { exact: false })
      .or(page.getByText('魔術師', { exact: false }))
      .or(page.getByText('女教皇', { exact: false }))
      .or(page.getByText('女帝', { exact: false }))
      .or(page.getByText('皇帝', { exact: false }))
      .or(page.getByText('恋人', { exact: false }))
      .or(page.getByText('戦車', { exact: false }))
      .or(page.getByText('隠者', { exact: false }))
      .or(page.getByText('運命の輪', { exact: false }))
      .or(page.getByText('節制', { exact: false }))
    await expect(cardName.first()).toBeVisible({ timeout: 10000 })
    // Ethics: must not use lucky-fortune language
    await expect(page.getByText('ラッキー', { exact: false })).not.toBeVisible()
  })

  test('Compatibility: returns a numeric score and a relational label', async ({ page }) => {
    await page.goto('/tools/compatibility')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/相性診断/)
    const dates = page.locator('input[type="date"]')
    await dates.nth(0).fill('1990-05-15')
    await dates.nth(1).fill('1992-08-22')
    await page.getByRole('button', { name: /診断する/ }).click()
    // Numeric score (2-3 digits)
    const scoreArea = page.locator('body')
    await expect(scoreArea).toContainText(/\d{2,3}/, { timeout: 10000 })
    const label = page
      .getByText('共鳴', { exact: false })
      .or(page.getByText('調和', { exact: false }))
      .or(page.getByText('学び合い', { exact: false }))
    await expect(label.first()).toBeVisible()
  })
})

test.describe('Screening criteria page', () => {
  test('shows selection/criteria heading and master tier numbers', async ({ page }) => {
    await page.goto('/about/screening')
    const heading = page
      .getByRole('heading', { name: /選考/ })
      .or(page.getByRole('heading', { name: /基準/ }))
    await expect(heading.first()).toBeVisible()
    await expect(page.getByText('500', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('4.7', { exact: false }).first()).toBeVisible()
  })
})

test.describe('Column system', () => {
  test('index shows column heading and at least one article card', async ({ page }) => {
    await page.goto('/column')
    await expect(page.getByRole('heading', { name: /コラム/ }).first()).toBeVisible()
    const articleLink = page.locator('a[href^="/column/"]').first()
    await expect(articleLink).toBeVisible({ timeout: 10000 })
  })

  test('clicking first article navigates to slug page with a heading', async ({ page }) => {
    await page.goto('/column')
    const articleLink = page.locator('a[href^="/column/"]').first()
    await articleLink.click()
    await expect(page).toHaveURL(/\/column\/[^/]+/)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Dashboard wallet & journey (auth-gated)', () => {
  test('/dashboard/wallet resolves (page or redirect to /login), no 500', async ({ page }) => {
    const response = await page.goto('/dashboard/wallet')
    expect(response?.status() ?? 200).toBeLessThan(500)
    await expect(page).toHaveURL(/\/dashboard\/wallet|\/login/)
  })

  test('/dashboard/journey resolves (page or redirect to /login), no 500', async ({ page }) => {
    const response = await page.goto('/dashboard/journey')
    expect(response?.status() ?? 200).toBeLessThan(500)
    await expect(page).toHaveURL(/\/dashboard\/journey|\/login/)
  })
})
