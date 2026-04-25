-- =============================================================================
-- 通知システム (notifications テーブル + RLS)
--
-- 用途: 予約成立 / キャンセル / レビュー受領 / セッション開始リマインダー等の
--       ユーザー向け in-app 通知を保存する。
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,                  -- e.g. 'booking_created', 'booking_confirmed', 'review_received'
  title        TEXT NOT NULL,
  body         TEXT,
  url          TEXT,                            -- クリック時の遷移先 (例: /dashboard/client)
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, read_at NULLS FIRST, created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_self" ON public.notifications;
CREATE POLICY "notifications_select_self" ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_self" ON public.notifications;
CREATE POLICY "notifications_update_self" ON public.notifications FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- INSERT は service_role 経由のみ (アプリ内部 API から)

-- 動作確認:
--   SELECT * FROM notifications WHERE user_id = auth.uid() ORDER BY created_at DESC;
