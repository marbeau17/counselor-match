-- =============================================================================
-- Admin 管理画面: スキーマ追加
--
-- 追加内容:
-- - profiles に is_banned / banned_at / banned_reason
-- - reviews に is_hidden / hidden_reason
-- - reports テーブル (通報)
-- - announcements テーブル (お知らせ)
-- - admin_audit_log テーブル (監査ログ)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles に BAN フラグ
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- -----------------------------------------------------------------------------
-- 2. reviews に非表示フラグ (soft delete のため値削除しない)
-- -----------------------------------------------------------------------------
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

-- 公開ページからは非表示分を除外するための index
CREATE INDEX IF NOT EXISTS idx_reviews_visible
  ON public.reviews (counselor_id, created_at DESC) WHERE is_hidden = false;

-- -----------------------------------------------------------------------------
-- 3. reports (通報)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('counselor','session','review','user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','reviewing','resolved','dismissed')),
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports (reporter_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reports_insert_self" ON public.reports;
CREATE POLICY "reports_insert_self" ON public.reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());
DROP POLICY IF EXISTS "reports_select_self" ON public.reports;
CREATE POLICY "reports_select_self" ON public.reports FOR SELECT
  USING (reporter_id = auth.uid());
-- admin 全件アクセスは service_role 経由

-- -----------------------------------------------------------------------------
-- 4. announcements (お知らせ)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info','warning','critical')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active
  ON public.announcements (is_published, starts_at DESC)
  WHERE is_published = true;

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
-- 公開中のお知らせは全員 SELECT 可
DROP POLICY IF EXISTS "announcements_select_published" ON public.announcements;
CREATE POLICY "announcements_select_published" ON public.announcements FOR SELECT
  USING (
    is_published = true
    AND starts_at <= NOW()
    AND (ends_at IS NULL OR ends_at >= NOW())
  );
-- 書込は service_role 経由

-- -----------------------------------------------------------------------------
-- 5. site_seo (ページ別 SEO メタ情報)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  canonical_url TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  custom_jsonld JSONB,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_seo_path ON public.site_seo (page_path);

ALTER TABLE public.site_seo ENABLE ROW LEVEL SECURITY;
-- 公開ページのメタ取得用に SELECT 公開
DROP POLICY IF EXISTS "site_seo_select_all" ON public.site_seo;
CREATE POLICY "site_seo_select_all" ON public.site_seo FOR SELECT USING (true);
-- 書込は service_role 経由

-- -----------------------------------------------------------------------------
-- 6. admin_audit_log (監査ログ)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  before JSONB,
  after JSONB,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor_created
  ON public.admin_audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_target
  ON public.admin_audit_log (target_type, target_id);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
-- SELECT/INSERT 共に service_role 経由のみ (admin チェックは API 側で)

-- =============================================================================
-- 動作確認:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'profiles' AND column_name LIKE 'is_banned';
--   SELECT * FROM reports LIMIT 0;
--   SELECT * FROM announcements LIMIT 0;
--   SELECT * FROM admin_audit_log LIMIT 0;
-- =============================================================================
