import { defineConfig, devices } from '@playwright/test'

/**
 * 本番環境 (https://counselors.aicreonext.com) 向け Playwright 設定。
 *
 * - webServer なし (本番 URL を直接叩く)
 * - testDir は e2e-prod/ のみ (ローカル e2e と分離)
 * - retries=2 (本番ネットワーク不安定対策)
 * - workers=2 (本番への負荷を抑える)
 * - 認証 spec は本番 DB を mutation しない読み取り中心の試験のみ
 *
 * 実行: PLAYWRIGHT_PROD_URL=https://counselors.aicreonext.com bunx playwright test --config=playwright.prod.config.ts
 */

const BASE_URL = process.env.PLAYWRIGHT_PROD_URL ?? 'https://counselors.aicreonext.com'

export default defineConfig({
  testDir: './e2e-prod',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 2,
  reporter: 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
    // 本番なので screenshot off (要らないログを残さない)
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
})
