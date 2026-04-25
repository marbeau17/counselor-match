-- =============================================================================
-- RLS 循環参照 (infinite recursion) 修正
--
-- 元の policy で profiles_select が counselors の subquery を含み、
-- counselors_select が profiles の評価を要求し、無限ループに陥っていた。
--
-- 修正方針:
-- - profiles SELECT は全員に公開（マッチングプラットフォームの性質上、表示名・
--   bio・avatar が public なのは仕様。email/phone を秘匿したい場合は別途
--   public_profiles VIEW を切る）
-- - counselors SELECT は is_active or owner or admin (subquery 外す)
-- - is_admin() helper の循環防止のため auth.uid() NULL なら即 false return
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. is_admin() を NULL 入力に強くする (循環防止)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin');
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. profiles の SELECT policy を「全員可」に書き換え (循環解消)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_self_or_counselor" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE は据え置き（自己編集 + admin のみ）

-- -----------------------------------------------------------------------------
-- 3. counselors の SELECT policy を subquery 外しシンプル化
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "counselors_select_active_or_owner" ON counselors;
CREATE POLICY "counselors_select_active_or_owner"
  ON counselors FOR SELECT
  USING (
    is_active = true
    OR user_id = auth.uid()
    OR public.is_admin()
  );
-- ※ 元と同じだが、profiles policy 簡素化により循環が消える

-- -----------------------------------------------------------------------------
-- 4. 検証用クエリ (動作確認は SQL Editor で個別に実行)
-- -----------------------------------------------------------------------------
-- SET LOCAL ROLE anon;
-- SELECT id, is_active FROM counselors WHERE is_active = true LIMIT 3;
-- SELECT id, full_name FROM profiles LIMIT 3;
-- RESET ROLE;
