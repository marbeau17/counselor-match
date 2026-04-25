import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PLAYWRIGHT_PORT ?? '4000'
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 2,
  // dev mode の HMR + Supabase 経由の DB クエリで並列負荷に弱いため worker を 1 に固定
  // (ローカル / CI 共通。安定性 > 速度)
  workers: 1,
  reporter: 'html',
  // dev mode + 並列実行で遅いことがあるため明示
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    // CI は pnpm、ローカルは bun (どちらも next dev を起動)
    command: process.env.CI
      ? `PORT=${PORT} pnpm exec next dev -p ${PORT}`
      : `PORT=${PORT} bun run next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
