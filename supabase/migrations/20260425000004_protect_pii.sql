-- =============================================================================
-- profiles の機微情報を anon から保護 (column-level GRANT 方式)
--
-- 現状: profiles_select_all (USING true) で email / phone も含めて誰でも閲覧可
-- 目的: マッチング表示用 (display_name / avatar_url 等) は公開維持しつつ、
--       email / phone / referred_by は anon・authenticated から不可視化
--
-- 設計:
-- - RLS policy は変更しない（profiles_select_all USING true のまま）
-- - PostgreSQL の column-level GRANT を使い、anon と authenticated は
--   public カラムのみ SELECT 可、service_role は全カラム可
-- - 本人 (auth.uid() = id) も email/phone を見たい場合があるが、
--   その場合は service_role 経由 API か、別途自分用 endpoint を作る
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Step 1: profiles の SELECT 権限を一旦 REVOKE
-- -----------------------------------------------------------------------------
REVOKE SELECT ON public.profiles FROM anon, authenticated;

-- -----------------------------------------------------------------------------
-- Step 2: 公開カラムだけを GRANT
-- -----------------------------------------------------------------------------
-- public カラム: マッチング表示・ダッシュボードで使われる非機微情報
GRANT SELECT (
  id,
  full_name,
  display_name,
  avatar_url,
  role,
  birth_date,
  growth_stage,
  created_at,
  updated_at
) ON public.profiles TO anon, authenticated;

-- 機微カラム: email, phone, line_user_id, referral_code, referred_by は GRANT しない
-- → anon/authenticated は SELECT 不可
-- → service_role (RLS バイパス + 全権) は元から全カラムアクセス可

-- -----------------------------------------------------------------------------
-- Step 3: profiles の INSERT/UPDATE は引き続き全カラム可（policy で id=auth.uid() で制限）
-- -----------------------------------------------------------------------------
-- INSERT/UPDATE は元から policy で本人のみ。column GRANT 不要。

-- =============================================================================
-- 動作確認:
--   SET LOCAL ROLE anon;
--   SELECT id, full_name FROM profiles LIMIT 3;     -- ✅ 成功
--   SELECT id, email FROM profiles LIMIT 1;          -- ❌ permission denied
--   RESET ROLE;
--
-- アプリ側影響:
-- - select=* は許可カラムのみ返却（PostgREST の挙動）
--   実際は select=*,profiles(*) で email/phone が落ちるだけで他は OK
-- - 自分の email/phone を取得したい場合は auth.user を使う
--   (Supabase auth.getUser() で email を取得可能)
-- =============================================================================
