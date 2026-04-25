-- =============================================================================
-- PII 保護 migration (20260425000004) を revert
--
-- 原因: profiles の SELECT 権限を REVOKE したことで、Supabase の signup フロー
--       内部で発火する trigger が profiles を読めず、500 エラーで signup 失敗
--
-- 対応: 一旦 SELECT 権限を全カラム復元。
--       PII 保護はアプリケーションレイヤー (UI でメール表示しない等) で対応するか、
--       VIEW 経由 + RLS の組合せを別途設計する。
-- =============================================================================

-- profiles の SELECT を anon, authenticated に全カラム復元
GRANT SELECT ON public.profiles TO anon, authenticated;

-- INSERT/UPDATE/DELETE は元から policy で制御されているため変更不要
-- RLS policy "profiles_select_all" (USING true) は Phase 19/20 から維持

-- =============================================================================
-- 確認:
--   SET LOCAL ROLE anon;
--   SELECT id, email, full_name FROM profiles LIMIT 1;  -- 全カラム返る
--   RESET ROLE;
-- =============================================================================
