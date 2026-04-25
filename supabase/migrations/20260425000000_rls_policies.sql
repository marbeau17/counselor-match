-- =============================================================================
-- Row Level Security (RLS) Policies
-- 全 12 テーブルに RLS を有効化し、role 別アクセス制御を定義する。
--
-- 設計方針:
-- - 公開閲覧 (anon でも可): counselors(is_active), reviews, columns, categories,
--   counselors の profiles join 用に profiles の SELECT も限定的に許可
-- - 自分のレコードのみ操作: profiles, bookings, wallets, journal_entries 等
-- - admin はすべて読み書き可
-- - service_role (SUPABASE_SERVICE_ROLE_KEY) は RLS をバイパスするため policy 不要
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ヘルパー関数: 現在のユーザーロール取得（profiles からキャッシュ）
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- =============================================================================
-- 1. profiles
--    SELECT: 自分 + counselors と join するため "counselor の user_id" は anon も可
--    INSERT: 自分のみ（auth.uid()）
--    UPDATE: 自分のみ
--    DELETE: admin のみ
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_self_or_counselor" ON profiles;
CREATE POLICY "profiles_select_self_or_counselor"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR id IN (SELECT user_id FROM counselors WHERE is_active = true)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
CREATE POLICY "profiles_insert_self"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_self" ON profiles;
CREATE POLICY "profiles_update_self"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;
CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- 2. categories (公開マスタ)
-- =============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_all" ON categories;
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "categories_write_admin" ON categories;
CREATE POLICY "categories_write_admin"
  ON categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- 3. counselors
--    SELECT: is_active = true は anon でも可、自分のレコードはオーナー
--    INSERT/UPDATE: 自分のレコードのみ (user_id = auth.uid())
--    DELETE: admin のみ
-- =============================================================================
ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "counselors_select_active_or_owner" ON counselors;
CREATE POLICY "counselors_select_active_or_owner"
  ON counselors FOR SELECT
  USING (is_active = true OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "counselors_insert_self" ON counselors;
CREATE POLICY "counselors_insert_self"
  ON counselors FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "counselors_update_self" ON counselors;
CREATE POLICY "counselors_update_self"
  ON counselors FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "counselors_delete_admin" ON counselors;
CREATE POLICY "counselors_delete_admin"
  ON counselors FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- 4. bookings
--    SELECT: 関係者 (client, counselor の user_id) のみ
--    INSERT: 自分が client であること
--    UPDATE: 関係者
-- =============================================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_participant" ON bookings;
CREATE POLICY "bookings_select_participant"
  ON bookings FOR SELECT
  USING (
    client_id = auth.uid()
    OR counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "bookings_insert_self_client" ON bookings;
CREATE POLICY "bookings_insert_self_client"
  ON bookings FOR INSERT
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "bookings_update_participant" ON bookings;
CREATE POLICY "bookings_update_participant"
  ON bookings FOR UPDATE
  USING (
    client_id = auth.uid()
    OR counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "bookings_delete_admin" ON bookings;
CREATE POLICY "bookings_delete_admin"
  ON bookings FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- 5. payments
--    SELECT: 関係者のみ
--    INSERT/UPDATE: service_role のみ（API 経由、Stripe webhook）
-- =============================================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_participant" ON payments;
CREATE POLICY "payments_select_participant"
  ON payments FOR SELECT
  USING (
    client_id = auth.uid()
    OR counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
    OR public.is_admin()
  );

-- payments の INSERT/UPDATE は service_role 専用 (RLS バイパスで操作)。anon ポリシーは作らない。

-- =============================================================================
-- 6. reviews
--    SELECT: 公開（is_anonymous でも本文は見せる、reviewer 名の扱いは UI 側）
--    INSERT: 自分が client の booking に対してのみ
-- =============================================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
CREATE POLICY "reviews_select_all"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "reviews_insert_self_client" ON reviews;
CREATE POLICY "reviews_insert_self_client"
  ON reviews FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND booking_id IN (SELECT id FROM bookings WHERE client_id = auth.uid())
  );

DROP POLICY IF EXISTS "reviews_update_self" ON reviews;
CREATE POLICY "reviews_update_self"
  ON reviews FOR UPDATE
  USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "reviews_delete_admin" ON reviews;
CREATE POLICY "reviews_delete_admin"
  ON reviews FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- 7. wallets
--    SELECT/UPDATE: 本人のみ
--    INSERT: service_role 経由のみ（getOrCreateWallet 内で実施）
-- =============================================================================
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_select_self" ON wallets;
CREATE POLICY "wallets_select_self"
  ON wallets FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "wallets_insert_self" ON wallets;
CREATE POLICY "wallets_insert_self"
  ON wallets FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "wallets_update_self" ON wallets;
CREATE POLICY "wallets_update_self"
  ON wallets FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- =============================================================================
-- 8. wallet_transactions
--    SELECT: ウォレット所有者のみ
--    INSERT: service_role 専用（API 経由）。anon ポリシーは作らない
-- =============================================================================
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_tx_select_owner" ON wallet_transactions;
CREATE POLICY "wallet_tx_select_owner"
  ON wallet_transactions FOR SELECT
  USING (
    wallet_id IN (SELECT id FROM wallets WHERE user_id = auth.uid())
    OR public.is_admin()
  );

-- =============================================================================
-- 9. review_axes
--    SELECT: 公開（reviews と同じく可視）
--    INSERT/UPDATE: review owner (client) のみ
-- =============================================================================
ALTER TABLE review_axes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "review_axes_select_all" ON review_axes;
CREATE POLICY "review_axes_select_all"
  ON review_axes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "review_axes_insert_review_owner" ON review_axes;
CREATE POLICY "review_axes_insert_review_owner"
  ON review_axes FOR INSERT
  WITH CHECK (
    review_id IN (SELECT id FROM reviews WHERE client_id = auth.uid())
  );

-- =============================================================================
-- 10. counselor_replies
--     SELECT: 公開
--     INSERT/UPDATE: counselor 本人のみ
-- =============================================================================
ALTER TABLE counselor_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "counselor_replies_select_all" ON counselor_replies;
CREATE POLICY "counselor_replies_select_all"
  ON counselor_replies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "counselor_replies_insert_counselor" ON counselor_replies;
CREATE POLICY "counselor_replies_insert_counselor"
  ON counselor_replies FOR INSERT
  WITH CHECK (
    counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "counselor_replies_update_counselor" ON counselor_replies;
CREATE POLICY "counselor_replies_update_counselor"
  ON counselor_replies FOR UPDATE
  USING (
    counselor_id IN (SELECT id FROM counselors WHERE user_id = auth.uid())
  );

-- =============================================================================
-- 11. journal_entries
--     完全プライベート: 本人のみ全権
-- =============================================================================
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "journal_entries_select_self" ON journal_entries;
CREATE POLICY "journal_entries_select_self"
  ON journal_entries FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "journal_entries_insert_self" ON journal_entries;
CREATE POLICY "journal_entries_insert_self"
  ON journal_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "journal_entries_update_self" ON journal_entries;
CREATE POLICY "journal_entries_update_self"
  ON journal_entries FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "journal_entries_delete_self" ON journal_entries;
CREATE POLICY "journal_entries_delete_self"
  ON journal_entries FOR DELETE
  USING (user_id = auth.uid());

-- =============================================================================
-- 12. columns
--     SELECT: published_at IS NOT NULL は anon も可
--     INSERT/UPDATE/DELETE: admin のみ
-- =============================================================================
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "columns_select_published" ON columns;
CREATE POLICY "columns_select_published"
  ON columns FOR SELECT
  USING (published_at IS NOT NULL OR public.is_admin());

DROP POLICY IF EXISTS "columns_write_admin" ON columns;
CREATE POLICY "columns_write_admin"
  ON columns FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- 動作確認用クエリ（コメントアウト、SQL Editor で個別に実行可）:
--   -- anon (未認証) で counselors の SELECT が is_active=true のみ返ること
--   SELECT id, is_active FROM counselors LIMIT 5;
--   -- 期待: 数行返る (RLS により is_active=true のみ)
--
--   -- 自分の profile が見えること（要 auth）
--   SELECT id, email, role FROM profiles WHERE id = auth.uid();
-- =============================================================================
