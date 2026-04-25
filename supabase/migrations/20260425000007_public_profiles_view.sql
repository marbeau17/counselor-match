-- =============================================================================
-- public_profiles VIEW (PII 抜き)
--
-- 設計: profiles の SELECT 権限は変更せず（前回 revert で復元済）、
--       UI 公開向けに PII (email/phone/line_user_id/referral_code/referred_by)
--       を含まない VIEW を別途提供。
--
-- アプリ側の使い方:
--   - カウンセラー一覧やセッション参加者表示など、他人を見る場面では
--     public_profiles を select する
--   - 自分のプロフィール (email/phone 含む) を見たい場合は profiles を select
--     (RLS で自分のみ読める policy が無い → 一旦 SELECT 全員可なので注意)
--
-- 注意: SECURITY INVOKER (デフォルト) なので、VIEW を SELECT する側の権限で
--       実行される。anon でも問題なく見える。
-- =============================================================================

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  id,
  full_name,
  display_name,
  avatar_url,
  role,
  birth_date,
  growth_stage,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_profiles IS
  'PII (email/phone/line_user_id/referral_code/referred_by) を含まない安全な profiles ビュー。一覧表示・他人参照に使う。';
