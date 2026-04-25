-- =============================================================================
-- RLS リセット & 再構築（scorched earth 方式）
--
-- 過去マイグレーションでの policy 残存や helper 関数経由の循環を完全排除する
-- ため、すべての RLS を一旦 OFF にしてから clean state で再構築する。
--
-- 実行順序:
--   1. 全テーブルの RLS を DISABLE (この間 policy 評価が走らないので安全)
--   2. 全 policy を DROP IF EXISTS で完全削除
--   3. helper 関数を DROP
--   4. 新しい単純 policy を CREATE (関数呼び出し・循環参照なし)
--   5. RLS を ENABLE
--
-- 設計原則:
--   - 関数呼び出し (is_admin 等) は使わない
--   - subquery を使う場合も対象テーブル自身を参照しない
--   - admin 操作は service_role 経由 (SUPABASE_SERVICE_ROLE_KEY)
-- =============================================================================

-- =============================================================================
-- Step 1: RLS を一旦 OFF
-- =============================================================================
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS counselors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallet_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_axes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS counselor_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS columns DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Step 2: 全 policy を DROP（過去のあらゆる名前を網羅）
-- =============================================================================
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

-- =============================================================================
-- Step 3: helper 関数を DROP
-- =============================================================================
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;

-- =============================================================================
-- Step 4: 単純 policy を CREATE（循環の余地なし）
-- =============================================================================

-- profiles: SELECT 全員、INSERT/UPDATE 自分、DELETE service_role のみ
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- categories: 全員 SELECT、書込 service_role
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);

-- counselors: SELECT は active or owner、書込は owner
CREATE POLICY "counselors_select_active_or_owner" ON counselors FOR SELECT
  USING (is_active = true OR user_id = auth.uid());
CREATE POLICY "counselors_insert_self" ON counselors FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "counselors_update_self" ON counselors FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- bookings: client + counselor の関係者のみ
CREATE POLICY "bookings_select_participant" ON bookings FOR SELECT
  USING (
    client_id = auth.uid()
    OR counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
  );
CREATE POLICY "bookings_insert_self_client" ON bookings FOR INSERT
  WITH CHECK (client_id = auth.uid());
CREATE POLICY "bookings_update_participant" ON bookings FOR UPDATE
  USING (
    client_id = auth.uid()
    OR counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
  );

-- payments: SELECT は関係者、書込は service_role
CREATE POLICY "payments_select_participant" ON payments FOR SELECT
  USING (
    client_id = auth.uid()
    OR counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
  );

-- reviews: SELECT 公開、INSERT は client が自分の booking に対してのみ
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_self_client" ON reviews FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND booking_id IN (SELECT id FROM bookings WHERE client_id = auth.uid())
  );
CREATE POLICY "reviews_update_self" ON reviews FOR UPDATE
  USING (client_id = auth.uid());

-- wallets: 本人のみ
CREATE POLICY "wallets_select_self" ON wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "wallets_insert_self" ON wallets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "wallets_update_self" ON wallets FOR UPDATE USING (user_id = auth.uid());

-- wallet_transactions: ウォレット所有者のみ SELECT
CREATE POLICY "wallet_tx_select_owner" ON wallet_transactions FOR SELECT
  USING (wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid()));

-- review_axes: SELECT 公開、INSERT は review owner
CREATE POLICY "review_axes_select_all" ON review_axes FOR SELECT USING (true);
CREATE POLICY "review_axes_insert_review_owner" ON review_axes FOR INSERT
  WITH CHECK (review_id IN (SELECT id FROM reviews WHERE client_id = auth.uid()));

-- counselor_replies: SELECT 公開、書込は counselor 本人
CREATE POLICY "counselor_replies_select_all" ON counselor_replies FOR SELECT USING (true);
CREATE POLICY "counselor_replies_insert_counselor" ON counselor_replies FOR INSERT
  WITH CHECK (counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid()));
CREATE POLICY "counselor_replies_update_counselor" ON counselor_replies FOR UPDATE
  USING (counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid()));

-- journal_entries: 完全プライベート
CREATE POLICY "journal_entries_all_self" ON journal_entries FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- columns: 公開コラムのみ SELECT、書込は service_role
CREATE POLICY "columns_select_published" ON columns FOR SELECT
  USING (published_at IS NOT NULL);

-- =============================================================================
-- Step 5: RLS を再 ENABLE
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_axes ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 動作確認 (SQL Editor で個別実行):
--   SET LOCAL ROLE anon;
--   SELECT id, is_active FROM counselors WHERE is_active = true LIMIT 3;
--   SELECT id, full_name FROM profiles LIMIT 3;
--   RESET ROLE;
--
-- 現在の policy 一覧確認:
--   SELECT tablename, policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- =============================================================================
