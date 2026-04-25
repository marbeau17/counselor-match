import { chromium, type FullConfig } from '@playwright/test'
import { TEST_USERS, type TestUserRole } from './_auth'
import path from 'node:path'

/**
 * 各テストユーザーで一度だけログインして storageState を保存する。
 * 個別 spec は loginAs() で都度ログインする代わりに保存済み state を利用するため、
 * 大幅に高速化される (mobile webkit + CI 環境で auth chain が高コストなため必須)。
 */
export const STORAGE_DIR = path.join(__dirname, '.auth')

export function storageStatePath(role: TestUserRole): string {
  return path.join(STORAGE_DIR, `${role}.json`)
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:4000'

  const browser = await chromium.launch()

  for (const role of Object.keys(TEST_USERS) as TestUserRole[]) {
    const user = TEST_USERS[role]
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    try {
      await page.goto(`${baseURL}/login`)
      await page.getByLabel('メールアドレス').fill(user.email)
      await page.getByLabel('パスワード').fill(user.password)
      await page.locator('form button[type="submit"]', { hasText: 'ログイン' }).click()

      const expectedPath = role === 'admin' ? /\/dashboard\/admin/
                         : role === 'counselor' ? /\/dashboard\/counselor/
                         : /\/dashboard\/client/
      await page.waitForURL(expectedPath, { timeout: 30000 })
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

      await ctx.storageState({ path: storageStatePath(role) })
      console.log(`[global-setup] ${role} → storageState saved`)
    } catch (err) {
      console.error(`[global-setup] failed for ${role}:`, (err as Error).message)
      throw err
    } finally {
      await ctx.close()
    }
  }

  await browser.close()
}
