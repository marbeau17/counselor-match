import { test, expect } from '@playwright/test'

/**
 * 主要 public ページの視覚回帰スナップショット。
 * 初回実行時に baseline を生成、以降は diff を検出して fail。
 *
 * baseline 更新: `bunx playwright test e2e/visual-regression.spec.ts --update-snapshots`
 *
 * 注意:
 * - chromium プロジェクトのみ実行 (mobile/firefox はレンダリング差異が大きく maintenance コスト高)
 * - 動的コンテンツ (relative date 等) は mask
 * - threshold は ratio 0.05 (5%) で意図しない大きな変更のみ検出
 */
// CI 環境ではスキップ (linux baseline 未生成 / 平台依存のため)
const SKIP = !!process.env.CI

test.describe('Visual regression (chromium only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium' || SKIP, 'chromium only / non-CI')

  const PAGES = [
    { path: '/', name: 'landing' },
    { path: '/counselors', name: 'counselors-list' },
    { path: '/about', name: 'about' },
    { path: '/about/screening', name: 'about-screening' },
    { path: '/login', name: 'login' },
    { path: '/register', name: 'register' },
  ]

  for (const { path, name } of PAGES) {
    test(`${name} (${path})`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle').catch(() => {})

      // フォントの flicker を回避
      await page.evaluate(() => document.fonts.ready)

      // 動的領域を非表示にする (相対日時 / バナー等)
      await page.addStyleTag({
        content: `
          [data-dynamic],
          [aria-live],
          .relative-time,
          time { visibility: hidden !important; }
        `,
      })

      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
      })
    })
  }
})
