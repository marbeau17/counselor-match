import type { Page } from '@playwright/test'

/**
 * ヘッダーのハンバーガー (md 未満で表示) を開く。デスクトップ幅では何もしない。
 */
export async function openMobileMenuIfNeeded(page: Page) {
  const menuBtn = page.getByRole('button', { name: 'メニュー' })
  if (await menuBtn.isVisible()) {
    await menuBtn.click()
  }
}

/**
 * `/counselors` のフィルタサイドバー展開ボタン (lg 未満で表示) を押す。
 * デスクトップ幅では何もしない。
 */
export async function openCounselorFiltersIfNeeded(page: Page) {
  const filterBtn = page.getByRole('button', { name: /^フィルター/ })
  if (await filterBtn.isVisible()) {
    await filterBtn.click()
  }
}
