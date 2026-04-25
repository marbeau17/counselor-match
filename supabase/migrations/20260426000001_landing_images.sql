-- =============================================================================
-- 20260426000001_landing_images.sql
-- 既存 landing_sections (page_key='home') の published_props に Unsplash 画像 URL を追加
-- + 新規 gallery セクションを追加
-- =============================================================================

-- 1. hero に bg_image_url 追加
UPDATE public.landing_sections
SET draft_props     = draft_props     || jsonb_build_object('bg_image_url', 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1920&q=75&auto=format&fit=crop'),
    published_props = published_props || jsonb_build_object('bg_image_url', 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1920&q=75&auto=format&fit=crop'),
    updated_at      = NOW()
WHERE page_key = 'home' AND section_type = 'hero';

-- 2. features に heading + image_url を items に注入
UPDATE public.landing_sections
SET draft_props     = jsonb_build_object(
      'heading', '私たちのアプローチ',
      'columns', 3,
      'items', jsonb_build_array(
        jsonb_build_object('icon', 'Heart', 'title', 'ホリスティック心理学', 'body', '身体・心・感情・魂の4層から本質に向き合う。', 'image_url', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=75&auto=format&fit=crop'),
        jsonb_build_object('icon', 'Compass', 'title', 'Soul Mirror Law', 'body', '関係性を鏡に、内側の真実を観る独自メソッド。', 'image_url', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=75&auto=format&fit=crop'),
        jsonb_build_object('icon', 'Shield', 'title', '守られた対話', 'body', '厳選カウンセラー・多軸レビュー・満足保証。', 'image_url', 'https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=800&q=75&auto=format&fit=crop')
      )
    ),
    published_props = jsonb_build_object(
      'heading', '私たちのアプローチ',
      'columns', 3,
      'items', jsonb_build_array(
        jsonb_build_object('icon', 'Heart', 'title', 'ホリスティック心理学', 'body', '身体・心・感情・魂の4層から本質に向き合う。', 'image_url', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=75&auto=format&fit=crop'),
        jsonb_build_object('icon', 'Compass', 'title', 'Soul Mirror Law', 'body', '関係性を鏡に、内側の真実を観る独自メソッド。', 'image_url', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=75&auto=format&fit=crop'),
        jsonb_build_object('icon', 'Shield', 'title', '守られた対話', 'body', '厳選カウンセラー・多軸レビュー・満足保証。', 'image_url', 'https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=800&q=75&auto=format&fit=crop')
      )
    ),
    updated_at = NOW()
WHERE page_key = 'home' AND section_type = 'features';

-- 3. how_it_works の各 step に image_url 追加
UPDATE public.landing_sections
SET draft_props     = jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('step', 1, 'title', '悩みとアプローチで探す',         'body', 'テーマと方法論からあなたに合う伴走者を絞り込みます。', 'image_url', 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=75&auto=format&fit=crop'),
      jsonb_build_object('step', 2, 'title', 'プロフィール・レビューを確認',    'body', '背景・専門・受け手の声を多角的に確かめます。',          'image_url', 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=600&q=75&auto=format&fit=crop'),
      jsonb_build_object('step', 3, 'title', 'セッションを予約',                'body', 'オンライン・チャット・電話から選べます。',              'image_url', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=75&auto=format&fit=crop'),
      jsonb_build_object('step', 4, 'title', '振り返りジャーナルで統合',        'body', '気づきを記録し、日々の内省として根づかせます。',        'image_url', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=75&auto=format&fit=crop')
    )),
    published_props = jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('step', 1, 'title', '悩みとアプローチで探す',         'body', 'テーマと方法論からあなたに合う伴走者を絞り込みます。', 'image_url', 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=75&auto=format&fit=crop'),
      jsonb_build_object('step', 2, 'title', 'プロフィール・レビューを確認',    'body', '背景・専門・受け手の声を多角的に確かめます。',          'image_url', 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=600&q=75&auto=format&fit=crop'),
      jsonb_build_object('step', 3, 'title', 'セッションを予約',                'body', 'オンライン・チャット・電話から選べます。',              'image_url', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=75&auto=format&fit=crop'),
      jsonb_build_object('step', 4, 'title', '振り返りジャーナルで統合',        'body', '気づきを記録し、日々の内省として根づかせます。',        'image_url', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=75&auto=format&fit=crop')
    )),
    updated_at = NOW()
WHERE page_key = 'home' AND section_type = 'how_it_works';

-- 4. tools_promo の各ツールに image_url 追加
UPDATE public.landing_sections
SET draft_props     = jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('href', '/tools/personality', 'icon', 'BookHeart', 'title', 'パーソナリティ診断',     'body', '32タイプの性格構造から、今の自分の在り方を内省する。', 'image_url', 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=800&q=75&auto=format&fit=crop'),
      jsonb_build_object('href', '/tools/tarot',       'icon', 'Sparkles',  'title', 'タロット・リフレクション', 'body', 'カードを通じて、いま向き合うべきテーマを見つめ直す。', 'image_url', 'https://images.unsplash.com/photo-1633158829799-96bb13cab779?w=800&q=75&auto=format&fit=crop'),
      jsonb_build_object('href', '/tools/compatibility','icon', 'Heart',    'title', '相性診断',                 'body', '関係性の相互作用を構造的に把握する。',                  'image_url', 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800&q=75&auto=format&fit=crop')
    )),
    published_props = jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('href', '/tools/personality', 'icon', 'BookHeart', 'title', 'パーソナリティ診断',     'body', '32タイプの性格構造から、今の自分の在り方を内省する。', 'image_url', 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=800&q=75&auto=format&fit=crop'),
      jsonb_build_object('href', '/tools/tarot',       'icon', 'Sparkles',  'title', 'タロット・リフレクション', 'body', 'カードを通じて、いま向き合うべきテーマを見つめ直す。', 'image_url', 'https://images.unsplash.com/photo-1633158829799-96bb13cab779?w=800&q=75&auto=format&fit=crop'),
      jsonb_build_object('href', '/tools/compatibility','icon', 'Heart',    'title', '相性診断',                 'body', '関係性の相互作用を構造的に把握する。',                  'image_url', 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800&q=75&auto=format&fit=crop')
    )),
    updated_at = NOW()
WHERE page_key = 'home' AND section_type = 'tools_promo';

-- 5. testimonials に avatar_url 追加
UPDATE public.landing_sections
SET draft_props     = jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('name', 'A.M さん', 'role', '30代 / 会社員',     'comment', '初めての利用でしたが、自分の内側に丁寧に向き合えた時間でした。', 'rating', 5, 'avatar_url', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=75&auto=format&fit=crop&crop=faces'),
      jsonb_build_object('name', 'K.T さん', 'role', '40代 / フリーランス','comment', '関係性に対する見方が変わりました。',                            'rating', 5, 'avatar_url', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=75&auto=format&fit=crop&crop=faces'),
      jsonb_build_object('name', 'S.R さん', 'role', '20代 / 学生',       'comment', '気づきを日々のジャーナルに残せるのが良いです。',               'rating', 4, 'avatar_url', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=75&auto=format&fit=crop&crop=faces')
    )),
    published_props = jsonb_build_object('items', jsonb_build_array(
      jsonb_build_object('name', 'A.M さん', 'role', '30代 / 会社員',     'comment', '初めての利用でしたが、自分の内側に丁寧に向き合えた時間でした。', 'rating', 5, 'avatar_url', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=75&auto=format&fit=crop&crop=faces'),
      jsonb_build_object('name', 'K.T さん', 'role', '40代 / フリーランス','comment', '関係性に対する見方が変わりました。',                            'rating', 5, 'avatar_url', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=75&auto=format&fit=crop&crop=faces'),
      jsonb_build_object('name', 'S.R さん', 'role', '20代 / 学生',       'comment', '気づきを日々のジャーナルに残せるのが良いです。',               'rating', 4, 'avatar_url', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=75&auto=format&fit=crop&crop=faces')
    )),
    updated_at = NOW()
WHERE page_key = 'home' AND section_type = 'testimonials';

-- 6. cta_banner に bg_image_url 追加
UPDATE public.landing_sections
SET draft_props     = draft_props     || jsonb_build_object('bg_image_url', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1920&q=75&auto=format&fit=crop'),
    published_props = published_props || jsonb_build_object('bg_image_url', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1920&q=75&auto=format&fit=crop'),
    updated_at      = NOW()
WHERE page_key = 'home' AND section_type = 'cta_banner';

-- 7. 新規 gallery セクション (sort_order 35: features と how_it_works の間)
INSERT INTO public.landing_sections (page_key, section_type, sort_order, is_visible, draft_props, published_props, published_at, created_at, updated_at)
SELECT 'home', 'gallery', 35, TRUE,
  jsonb_build_object(
    'heading', 'あなたの内側に、もう一度静けさを',
    'subheading', '自然・呼吸・余白──私たちが大切にしている世界観',
    'items', jsonb_build_array(
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=75&auto=format&fit=crop', 'alt', '森の朝の光', 'caption', '光と影の対話'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1474524955719-b9f87c50ce47?w=800&q=75&auto=format&fit=crop', 'alt', '湖の朝霧'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=75&auto=format&fit=crop', 'alt', '山々のシルエット'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=75&auto=format&fit=crop', 'alt', '苔と水'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=800&q=75&auto=format&fit=crop', 'alt', '花の影'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=75&auto=format&fit=crop', 'alt', '夕焼けの空'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=75&auto=format&fit=crop', 'alt', '海辺の岩'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=800&q=75&auto=format&fit=crop', 'alt', '月夜の砂浜')
    )
  ),
  jsonb_build_object(
    'heading', 'あなたの内側に、もう一度静けさを',
    'subheading', '自然・呼吸・余白──私たちが大切にしている世界観',
    'items', jsonb_build_array(
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=75&auto=format&fit=crop', 'alt', '森の朝の光', 'caption', '光と影の対話'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1474524955719-b9f87c50ce47?w=800&q=75&auto=format&fit=crop', 'alt', '湖の朝霧'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=75&auto=format&fit=crop', 'alt', '山々のシルエット'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=75&auto=format&fit=crop', 'alt', '苔と水'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=800&q=75&auto=format&fit=crop', 'alt', '花の影'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=75&auto=format&fit=crop', 'alt', '夕焼けの空'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=75&auto=format&fit=crop', 'alt', '海辺の岩'),
      jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=800&q=75&auto=format&fit=crop', 'alt', '月夜の砂浜')
    )
  ),
  NOW(), NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.landing_sections WHERE page_key = 'home' AND section_type = 'gallery'
);
