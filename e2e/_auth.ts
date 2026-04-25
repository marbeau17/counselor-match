import type { Page, BrowserContext } from '@playwright/test'
import { expect } from '@playwright/test'
import { storageStatePath } from './global-setup'

/** E2E テストユーザー (06_test_users.sql + 08_e2e_user_data.sql で seed 済) */
export const TEST_USERS = {
  client: {
    email: 'e2e_client_001@example.com',
    password: 'TestPass!2026',
    displayName: 'クライアント1',
  },
  counselor: {
    email: 'e2e_counselor_001@example.com',
    password: 'TestPass!2026',
    displayName: 'カウンセラー1',
  },
  admin: {
    email: 'e2e_admin_001@example.com',
    password: 'TestPass!2026',
    displayName: '管理者1',
  },
} as const

export type TestUserRole = keyof typeof TEST_USERS

/**
 * 指定 role の storage state (cookies/localStorage) を test context に注入。
 * global-setup.ts で予めログインしておいた state を使うため、テスト内で
 * ログインフローを実行する必要がない (大幅な高速化)。
 *
 * 後方互換: 既存テストの `loginAs(page, role)` 呼び出しはそのまま動作する。
 * 内部で context.addCookies + localStorage を反映 + ダッシュボードへ goto する。
 */
export async function loginAs(page: Page, role: TestUserRole): Promise<void> {
  const fs = await import('node:fs')
  const statePath = storageStatePath(role)
  if (!fs.existsSync(statePath)) {
    throw new Error(`storageState file missing: ${statePath} (global-setup.ts が実行されていない可能性)`)
  }
  const state = JSON.parse(fs.readFileSync(statePath, 'utf-8')) as {
    cookies?: Parameters<BrowserContext['addCookies']>[0]
    origins?: { origin: string; localStorage: { name: string; value: string }[] }[]
  }

  // cookies 復元
  if (state.cookies && state.cookies.length > 0) {
    await page.context().addCookies(state.cookies)
  }

  // localStorage 復元 (origin が一致するもののみ)
  if (state.origins) {
    for (const o of state.origins) {
      await page.goto(o.origin)
      await page.evaluate((items) => {
        for (const it of items) localStorage.setItem(it.name, it.value)
      }, o.localStorage)
    }
  }

  // role ダッシュボードへ
  const dashboardPath = role === 'admin' ? '/dashboard/admin'
                      : role === 'counselor' ? '/dashboard/counselor'
                      : '/dashboard/client'
  await page.goto(dashboardPath)
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
}
