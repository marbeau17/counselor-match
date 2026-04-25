-- =============================================================================
-- RLS 単純化: is_admin() helper を policies から完全除去
--
-- PostgreSQL の RLS planner は SECURITY DEFINER 関数経由でも循環を検出する
-- ことがあり、is_admin() を policy で呼ぶと "infinite recursion detected"
-- エラーが出る。
--
-- 方針:
-- - 公開閲覧 (SELECT): anon でも見える / 個別所有者の判定は auth.uid() 直接
-- - 自分のレコードのみ書き込み: auth.uid() 直接比較
-- - admin 操作は service_role 経由 (RLS バイパス) で実施
--   → Stripe webhook, admin dashboard 等は SUPABASE_SERVICE_ROLE_KEY を使う
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_self_or_counselor" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
-- DELETE は service_role 経由のみ (anon/authenticated には policy なし → DENY)

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_write_admin" ON categories;
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
-- 書き込みは service_role 経由のみ

-- -----------------------------------------------------------------------------
-- counselors
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "counselors_select_active_or_owner" ON counselors;
DROP POLICY IF EXISTS "counselors_insert_self" ON counselors;
DROP POLICY IF EXISTS "counselors_update_self" ON counselors;
DROP POLICY IF EXISTS "counselors_delete_admin" ON counselors;

CREATE POLICY "counselors_select_active_or_owner" ON counselors FOR SELECT
  USING (is_active = true OR user_id = auth.uid());
CREATE POLICY "counselors_insert_self" ON counselors FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "counselors_update_self" ON counselors FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- bookings
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "bookings_select_participant" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_self_client" ON bookings;
DROP POLICY IF EXISTS "bookings_update_participant" ON bookings;
DROP POLICY IF EXISTS "bookings_delete_admin" ON bookings;

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

-- -----------------------------------------------------------------------------
-- payments (service_role 経由のみ書込、SELECT は関係者)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "payments_select_participant" ON payments;
CREATE POLICY "payments_select_participant" ON payments FOR SELECT
  USING (
    client_id = auth.uid()
    OR counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- reviews
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_self_client" ON reviews;
DROP POLICY IF EXISTS "reviews_update_self" ON reviews;
DROP POLICY IF EXISTS "reviews_delete_admin" ON reviews;

CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_self_client" ON reviews FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND booking_id IN (SELECT id FROM bookings WHERE client_id = auth.uid())
  );
CREATE POLICY "reviews_update_self" ON reviews FOR UPDATE
  USING (client_id = auth.uid());

-- -----------------------------------------------------------------------------
-- wallets
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "wallets_select_self" ON wallets;
DROP POLICY IF EXISTS "wallets_insert_self" ON wallets;
DROP POLICY IF EXISTS "wallets_update_self" ON wallets;

CREATE POLICY "wallets_select_self" ON wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "wallets_insert_self" ON wallets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "wallets_update_self" ON wallets FOR UPDATE USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- wallet_transactions
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "wallet_tx_select_owner" ON wallet_transactions;
CREATE POLICY "wallet_tx_select_owner" ON wallet_transactions FOR SELECT
  USING (wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- review_axes
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "review_axes_select_all" ON review_axes;
DROP POLICY IF EXISTS "review_axes_insert_review_owner" ON review_axes;

CREATE POLICY "review_axes_select_all" ON review_axes FOR SELECT USING (true);
CREATE POLICY "review_axes_insert_review_owner" ON review_axes FOR INSERT
  WITH CHECK (review_id IN (SELECT id FROM reviews WHERE client_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- counselor_replies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "counselor_replies_select_all" ON counselor_replies;
DROP POLICY IF EXISTS "counselor_replies_insert_counselor" ON counselor_replies;
DROP POLICY IF EXISTS "counselor_replies_update_counselor" ON counselor_replies;

CREATE POLICY "counselor_replies_select_all" ON counselor_replies FOR SELECT USING (true);
CREATE POLICY "counselor_replies_insert_counselor" ON counselor_replies FOR INSERT
  WITH CHECK (counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid()));
CREATE POLICY "counselor_replies_update_counselor" ON counselor_replies FOR UPDATE
  USING (counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- journal_entries (完全プライベート)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "journal_entries_select_self" ON journal_entries;
DROP POLICY IF EXISTS "journal_entries_insert_self" ON journal_entries;
DROP POLICY IF EXISTS "journal_entries_update_self" ON journal_entries;
DROP POLICY IF EXISTS "journal_entries_delete_self" ON journal_entries;

CREATE POLICY "journal_entries_all_self" ON journal_entries FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- columns (公開コラム、書込は service_role 経由)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "columns_select_published" ON columns;
DROP POLICY IF EXISTS "columns_write_admin" ON columns;
CREATE POLICY "columns_select_published" ON columns FOR SELECT
  USING (published_at IS NOT NULL);

-- -----------------------------------------------------------------------------
-- 不要 helper の cleanup
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.current_user_role();

-- -----------------------------------------------------------------------------
-- 動作確認 (SQL Editor で個別実行):
--   SET LOCAL ROLE anon;
--   SELECT id, is_active FROM counselors WHERE is_active = true LIMIT 3;
--   SELECT id, full_name FROM profiles LIMIT 3;
--   RESET ROLE;
-- =============================================================================
