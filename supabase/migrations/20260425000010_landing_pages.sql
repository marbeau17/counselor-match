-- =============================================================================
-- LP 動的化 + Gemini 画像生成 + プロンプトテンプレ + 暗号化キーストア
--
-- 6 テーブル:
--   landing_sections (動的セクション + draft/published 二重列 + A/B)
--   landing_publish_history (公開スナップショット)
--   prompt_templates (画像生成プロンプトテンプレ)
--   generated_images (Gemini 生成画像)
--   landing_section_image_uses (画像 ↔ セクション紐付け)
--   app_settings (汎用設定 / 暗号化 API キー保管)
-- + storage bucket: public-images
-- + 既存 LP コンテンツの seed
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. app_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value_encrypted TEXT,
  value_plain TEXT,
  is_secret BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
-- 全ての操作は service_role 経由のみ (RLS で全 policy なし → anon/authenticated 完全拒否)

INSERT INTO public.app_settings (key, value_plain, is_secret, description)
VALUES
  ('gemini.image_model', 'gemini-3-pro-image-preview', false, 'Gemini 画像生成モデル名')
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. prompt_templates
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  prompt_template TEXT NOT NULL,
  default_aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  default_size_preset TEXT NOT NULL DEFAULT 'standard',
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON public.prompt_templates (category);
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. generated_images
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  prompt_template_id UUID REFERENCES public.prompt_templates(id),
  model TEXT NOT NULL DEFAULT 'gemini-3-pro-image-preview',
  aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  size_preset TEXT NOT NULL DEFAULT 'standard',
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','succeeded','failed')),
  error_message TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_generated_images_created ON public.generated_images (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_tags ON public.generated_images USING gin(tags);
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. landing_sections (draft/published 二重列 + A/B)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL DEFAULT 'home',
  section_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  draft_props JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_props JSONB,
  published_at TIMESTAMPTZ,
  has_unpublished_changes BOOLEAN GENERATED ALWAYS AS (
    published_props IS NULL OR draft_props IS DISTINCT FROM published_props
  ) STORED,
  variant_key TEXT,
  variant_weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_landing_sections_page_order ON public.landing_sections (page_key, sort_order);
CREATE INDEX IF NOT EXISTS idx_landing_sections_variant ON public.landing_sections (variant_key) WHERE variant_key IS NOT NULL;
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;
-- 公開ページは published_props があるもののみ
DROP POLICY IF EXISTS "landing_sections_select_published" ON public.landing_sections;
CREATE POLICY "landing_sections_select_published" ON public.landing_sections FOR SELECT
  USING (is_visible = true AND published_props IS NOT NULL);

-- -----------------------------------------------------------------------------
-- 5. landing_publish_history
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.landing_publish_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL DEFAULT 'home',
  snapshot JSONB NOT NULL,
  published_by UUID REFERENCES public.profiles(id),
  note TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_landing_publish_history_page ON public.landing_publish_history (page_key, published_at DESC);
ALTER TABLE public.landing_publish_history ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 6. landing_section_image_uses
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.landing_section_image_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.landing_sections(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
  field_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, image_id, field_path)
);
CREATE INDEX IF NOT EXISTS idx_image_uses_section ON public.landing_section_image_uses (section_id);
CREATE INDEX IF NOT EXISTS idx_image_uses_image ON public.landing_section_image_uses (image_id);
ALTER TABLE public.landing_section_image_uses ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 7. Storage bucket: public-images (public read)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-images', 'public-images', true)
ON CONFLICT (id) DO NOTHING;

-- public read policy
DROP POLICY IF EXISTS "Public read public-images" ON storage.objects;
CREATE POLICY "Public read public-images" ON storage.objects FOR SELECT
  USING (bucket_id = 'public-images');
-- 書込は service_role 経由のみ

-- =============================================================================
-- SEED: 既存 LP コンテンツを landing_sections に投入
-- (draft / published 同一値で初期公開状態に)
-- =============================================================================
DO $seed$
DECLARE
  v_props JSONB;
BEGIN
  -- 既に seed 済ならスキップ
  IF EXISTS (SELECT 1 FROM public.landing_sections WHERE page_key = 'home') THEN
    RETURN;
  END IF;

  -- 1. hero
  v_props := jsonb_build_object(
    'headline', '心と関係を整える、伴走型のスピリチュアル・カウンセリング',
    'subheadline', 'ホリスティック心理学 × Soul Mirror Law。あなた本来の地図を、信頼できる伴走者と。',
    'cta_label', 'あなたに合う伴走者を探す',
    'cta_url', '/counselors',
    'bg_image_url', null
  );
  INSERT INTO public.landing_sections (page_key, section_type, sort_order, draft_props, published_props, published_at)
  VALUES ('home', 'hero', 10, v_props, v_props, NOW());

  -- 2. trust_bar
  v_props := jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('label', '厳選審査済み'),
    jsonb_build_object('label', '多軸レビュー'),
    jsonb_build_object('label', '守秘義務'),
    jsonb_build_object('label', '満足保証')
  ));
  INSERT INTO public.landing_sections (page_key, section_type, sort_order, draft_props, published_props, published_at)
  VALUES ('home', 'trust_bar', 20, v_props, v_props, NOW());

  -- 3. features
  v_props := jsonb_build_object(
    'columns', 3,
    'items', jsonb_build_array(
      jsonb_build_object('icon', 'Heart', 'title', 'ホリスティック心理学', 'body', '身体・心・感情・魂の4層から本質に向き合う。'),
      jsonb_build_object('icon', 'Compass', 'title', 'Soul Mirror Law', 'body', '関係性を鏡に、内側の真実を観る独自メソッド。'),
      jsonb_build_object('icon', 'Shield', 'title', '守られた対話', 'body', '厳選カウンセラー・多軸レビュー・満足保証。')
    )
  );
  INSERT INTO public.landing_sections (page_key, section_type, sort_order, draft_props, published_props, published_at)
  VALUES ('home', 'features', 30, v_props, v_props, NOW());

  -- 4. how_it_works
  v_props := jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('step', 1, 'title', '悩みとアプローチで探す', 'body', 'テーマと方法論からあなたに合う伴走者を絞り込みます。', 'image_url', null),
    jsonb_build_object('step', 2, 'title', 'プロフィール・レビューを確認', 'body', '背景・専門・受け手の声を多角的に確かめます。', 'image_url', null),
    jsonb_build_object('step', 3, 'title', 'セッションを予約', 'body', 'オンライン・チャット・電話から選べます。', 'image_url', null),
    jsonb_build_object('step', 4, 'title', '振り返りジャーナルで統合', 'body', '気づきを記録し、日々の内省として根づかせます。', 'image_url', null)
  ));
  INSERT INTO public.landing_sections (page_key, section_type, sort_order, draft_props, published_props, published_at)
  VALUES ('home', 'how_it_works', 40, v_props, v_props, NOW());

  -- 5. tools_promo
  v_props := jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('href', '/tools/personality', 'icon', 'BookHeart', 'title', 'パーソナリティ診断', 'body', '32タイプの性格構造から、今の自分の在り方を内省する。'),
    jsonb_build_object('href', '/tools/tarot', 'icon', 'Sparkles', 'title', 'タロット・リフレクション', 'body', 'カードを通じて、いま向き合うべきテーマを見つめ直す。'),
    jsonb_build_object('href', '/tools/compatibility', 'icon', 'Heart', 'title', '相性診断', 'body', '関係性の相互作用を構造的に把握する。')
  ));
  INSERT INTO public.landing_sections (page_key, section_type, sort_order, draft_props, published_props, published_at)
  VALUES ('home', 'tools_promo', 50, v_props, v_props, NOW());

  -- 6. counselor_showcase
  v_props := jsonb_build_object('count', 3, 'filter', jsonb_build_object('level', 'master'), 'cta_url', '/counselors');
  INSERT INTO public.landing_sections (page_key, section_type, sort_order, draft_props, published_props, published_at)
  VALUES ('home', 'counselor_showcase', 60, v_props, v_props, NOW());

  -- 7. testimonials (仮データ)
  v_props := jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('name', 'A.M さん', 'role', '30代 / 会社員', 'comment', '初めての利用でしたが、自分の内側に丁寧に向き合えた時間でした。', 'rating', 5),
    jsonb_build_object('name', 'K.T さん', 'role', '40代 / フリーランス', 'comment', '関係性に対する見方が変わりました。', 'rating', 5),
    jsonb_build_object('name', 'S.R さん', 'role', '20代 / 学生', 'comment', '気づきを日々のジャーナルに残せるのが良いです。', 'rating', 4)
  ));
  INSERT INTO public.landing_sections (page_key, section_type, sort_order, draft_props, published_props, published_at)
  VALUES ('home', 'testimonials', 70, v_props, v_props, NOW());

  -- 8. column_promo
  v_props := jsonb_build_object('count', 3);
  INSERT INTO public.landing_sections (page_key, section_type, sort_order, draft_props, published_props, published_at)
  VALUES ('home', 'column_promo', 80, v_props, v_props, NOW());

  -- 9. cta_banner
  v_props := jsonb_build_object(
    'headline', 'あなたに合うカウンセラーを見つけませんか',
    'subheadline', '無料登録で 1,000 円分のお試しチャージ付き',
    'cta_label', '無料で始める',
    'cta_url', '/register',
    'bg_image_url', null
  );
  INSERT INTO public.landing_sections (page_key, section_type, sort_order, draft_props, published_props, published_at)
  VALUES ('home', 'cta_banner', 90, v_props, v_props, NOW());
END
$seed$;

-- =============================================================================
-- SEED: プロンプトテンプレート初期 6 件
-- =============================================================================
DO $tpl_seed$
BEGIN
  IF EXISTS (SELECT 1 FROM public.prompt_templates) THEN
    RETURN;
  END IF;

  INSERT INTO public.prompt_templates (name, category, prompt_template, default_aspect_ratio, default_size_preset, variables, is_favorite) VALUES
    ('柔らかい朝光ヒーロー', 'hero',
     'soft morning light through linen curtains, minimal japanese interior, warm earthy tones, abstract bokeh, photographic, dreamy, no text',
     '16:9', 'hd', '[]'::jsonb, true),

    ('ステップ説明イラスト', 'illustration',
     'minimalist illustration of {topic}, soft watercolor, beige and emerald palette, clean composition, no text',
     '1:1', 'standard',
     '[{"name":"topic","label":"主題","default":"a person looking at glowing constellation map"}]'::jsonb,
     true),

    ('暖かいポートレート', 'illustration',
     'warm portrait silhouette in {situation}, golden hour, soft focus, cinematic, no text',
     '1:1', 'standard',
     '[{"name":"situation","label":"シーン","default":"conversation"}]'::jsonb,
     false),

    ('CTA バナー サンライズ', 'banner',
     'expansive sunrise over still water, hopeful, painterly, no text, room for overlay copy',
     '16:9', 'hd', '[]'::jsonb, true),

    ('証言用 アバター', 'avatar',
     'soft watercolor portrait of {age} {style} person, gentle smile, neutral background, no text',
     '1:1', 'standard',
     '[{"name":"age","label":"年代","default":"30s"},{"name":"style","label":"スタイル","default":"japanese woman"}]'::jsonb,
     false),

    ('帯バナー (ウルトラワイド)', 'banner',
     'subtle abstract gradient with soft floating particles in {palette} palette, cinematic, no text',
     '21:9', 'hd',
     '[{"name":"palette","label":"配色","default":"emerald and warm beige"}]'::jsonb,
     false);
END
$tpl_seed$;

-- =============================================================================
-- 動作確認:
--   SELECT key, is_secret, value_plain FROM public.app_settings;
--   SELECT section_type, sort_order, is_visible FROM public.landing_sections WHERE page_key='home' ORDER BY sort_order;
--   SELECT name, category FROM public.prompt_templates ORDER BY is_favorite DESC, name;
--   SELECT id, name, public FROM storage.buckets WHERE id='public-images';
-- =============================================================================
