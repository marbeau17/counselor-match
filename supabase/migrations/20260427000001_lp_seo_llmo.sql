-- =============================================================================
-- 20260427000001_lp_seo_llmo.sql
-- LP 管理画面 SEO + LLMO 強化
-- spec: docs/lp_admin_seo_llmo_spec.md §5
-- =============================================================================

-- 1. landing_sections に SEO + LLMO 列追加
ALTER TABLE public.landing_sections
  ADD COLUMN IF NOT EXISTS heading_level text DEFAULT 'h2',
  ADD COLUMN IF NOT EXISTS seo_keywords text[],
  ADD COLUMN IF NOT EXISTS qa_pairs jsonb,
  ADD COLUMN IF NOT EXISTS howto_steps jsonb,
  ADD COLUMN IF NOT EXISTS citations jsonb,
  ADD COLUMN IF NOT EXISTS direct_answer text;

-- heading_level の制約 (CHECK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'landing_sections_heading_level_check'
  ) THEN
    ALTER TABLE public.landing_sections
      ADD CONSTRAINT landing_sections_heading_level_check
      CHECK (heading_level IN ('h1', 'h2', 'h3'));
  END IF;
END $$;

-- 既存 hero を h1, それ以外を h2 に
UPDATE public.landing_sections SET heading_level = 'h1' WHERE section_type = 'hero' AND heading_level IS NULL;
UPDATE public.landing_sections SET heading_level = 'h2' WHERE heading_level IS NULL;

-- 2. landing_pages テーブル新規 (page-level SEO 設定)
CREATE TABLE IF NOT EXISTS public.landing_pages (
  page_key text PRIMARY KEY,
  seo_title text,
  seo_description text,
  seo_canonical text,
  og_image_url text,
  robots_index boolean DEFAULT true,
  breadcrumb_label text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at 自動更新
DROP TRIGGER IF EXISTS landing_pages_updated_at ON public.landing_pages;
CREATE TRIGGER landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS landing_pages_select_all ON public.landing_pages;
CREATE POLICY landing_pages_select_all ON public.landing_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS landing_pages_admin_write ON public.landing_pages;
CREATE POLICY landing_pages_admin_write ON public.landing_pages FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role='admin'));

-- 初期 row (home) を idempotent に
INSERT INTO public.landing_pages (page_key, seo_title, seo_description, og_image_url, breadcrumb_label)
VALUES (
  'home',
  '心と関係を整える、伴走型のスピリチュアル・カウンセリング',
  '急かされない場所で、誰かに、ゆっくり聞いてほしい。ホリスティック心理学に根ざした伴走型のオンラインカウンセリング。',
  NULL,
  'ホーム'
)
ON CONFLICT (page_key) DO NOTHING;
