import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

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
 * ログインフローを実行して `/dashboard/{role}` へ到達するまで待つ。
 * router.push('/dashboard') による role 別リダイレクトの完了まで待機する。
 */
export async function loginAs(page: Page, role: TestUserRole): Promise<void> {
  const user = TEST_USERS[role]
  await page.goto('/login')
  await page.getByLabel('メールアドレス').fill(user.email)
  await page.getByLabel('パスワード').fill(user.password)
  await page.locator('form button[type="submit"]', { hasText: 'ログイン' }).click()

  // 認証サービス未設定なら早期失敗
  const authUnavailable = page.getByText('認証サービスが利用できません')
  if (await authUnavailable.isVisible({ timeout: 1500 }).catch(() => false)) {
    throw new Error('Supabase auth unavailable - check NEXT_PUBLIC_SUPABASE_URL/ANON_KEY env')
  }

  // /dashboard/{client|counselor|admin} まで遷移完了を待つ
  // (login → /dashboard → role 別 redirect → /dashboard/{role})
  // CI / mobile webkit ではログイン chain が長くなるため timeout を厚めに
  const expectedPath = role === 'admin' ? /\/dashboard\/admin/
                     : role === 'counselor' ? /\/dashboard\/counselor/
                     : /\/dashboard\/client/
  await page.waitForURL(expectedPath, { timeout: 30000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

  // h1 が出るまで安定化
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
}
