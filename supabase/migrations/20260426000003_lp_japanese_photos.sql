-- =============================================================================
-- 20260426000003_lp_japanese_photos.sql
-- 写真を日本文化的な静物 + 後ろ姿に差し替え + testimonial avatar 削除
-- (外国人モデル写真の排除 / 日本人ターゲット最適化)
-- =============================================================================

-- 1. hero: 障子から差す光のある和室空間
UPDATE public.landing_sections
SET draft_props     = jsonb_set(draft_props,     '{photo_url}', to_jsonb('https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1000&q=80&auto=format&fit=crop'::text)),
    published_props = jsonb_set(published_props, '{photo_url}', to_jsonb('https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1000&q=80&auto=format&fit=crop'::text)),
    updated_at      = NOW()
WHERE page_key='home' AND section_type='hero';

UPDATE public.landing_sections
SET draft_props     = jsonb_set(draft_props,     '{photo_alt}', to_jsonb('障子越しに差し込む朝の光と和室'::text)),
    published_props = jsonb_set(published_props, '{photo_alt}', to_jsonb('障子越しに差し込む朝の光と和室'::text)),
    updated_at      = NOW()
WHERE page_key='home' AND section_type='hero';

-- 2. features (3 items 全 image_url を日本的なディテールに)
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'eyebrow', 'Three commitments',
  'heading', '3 つの、大切にしていること',
  'columns', 3,
  'items', jsonb_build_array(
    jsonb_build_object('title', '聴くこと', 'body', '解決を急がずに、まず理解する。あなたの言葉のリズムや沈黙そのものを大切にします。', 'image_url', 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('title', '映すこと', 'body', '関係性を鏡として、自分の内側に出会う。気づきは、対話の中でゆっくりと立ち上がります。', 'image_url', 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('title', '守ること', 'body', '守秘・誠実さ・専門性で、対話の場そのものを支えます。安心して、ほどけてください。', 'image_url', 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80&auto=format&fit=crop')
  )
),
published_props = jsonb_build_object(
  'eyebrow', 'Three commitments',
  'heading', '3 つの、大切にしていること',
  'columns', 3,
  'items', jsonb_build_array(
    jsonb_build_object('title', '聴くこと', 'body', '解決を急がずに、まず理解する。あなたの言葉のリズムや沈黙そのものを大切にします。', 'image_url', 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('title', '映すこと', 'body', '関係性を鏡として、自分の内側に出会う。気づきは、対話の中でゆっくりと立ち上がります。', 'image_url', 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('title', '守ること', 'body', '守秘・誠実さ・専門性で、対話の場そのものを支えます。安心して、ほどけてください。', 'image_url', 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80&auto=format&fit=crop')
  )
),
updated_at = NOW()
WHERE page_key='home' AND section_type='features';

-- 3. how_it_works (4 step 全 image_url を日本的に)
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'eyebrow', 'Your journey',
  'heading', '対話までの、ゆっくりとした 4 ステップ',
  'items', jsonb_build_array(
    jsonb_build_object('step', 1, 'title', '静かに探す', 'body', '今の自分に合いそうな人を、テーマや言葉の温度から絞り込みます。', 'image_url', 'https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 2, 'title', '声に触れる', 'body', 'プロフィールや受け手の声から、その人の「在り方」を確かめます。', 'image_url', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 3, 'title', '対話する', 'body', 'オンラインの落ち着いた時間で、ただ話す、ただ聴いてもらう。', 'image_url', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 4, 'title', '書き残す', 'body', '気づきをジャーナルに置いておく。次の自分が読み返せるように。', 'image_url', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80&auto=format&fit=crop')
  )
),
published_props = jsonb_build_object(
  'eyebrow', 'Your journey',
  'heading', '対話までの、ゆっくりとした 4 ステップ',
  'items', jsonb_build_array(
    jsonb_build_object('step', 1, 'title', '静かに探す', 'body', '今の自分に合いそうな人を、テーマや言葉の温度から絞り込みます。', 'image_url', 'https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 2, 'title', '声に触れる', 'body', 'プロフィールや受け手の声から、その人の「在り方」を確かめます。', 'image_url', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 3, 'title', '対話する', 'body', 'オンラインの落ち着いた時間で、ただ話す、ただ聴いてもらう。', 'image_url', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 4, 'title', '書き残す', 'body', '気づきをジャーナルに置いておく。次の自分が読み返せるように。', 'image_url', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80&auto=format&fit=crop')
  )
),
updated_at = NOW()
WHERE page_key='home' AND section_type='how_it_works';

-- 4. testimonials: avatar_url を完全に削除 (フォールバックで日本語イニシャル badge 表示)
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'eyebrow', 'Voices',
  'heading', '言葉になった気づきたち',
  'items', jsonb_build_array(
    jsonb_build_object('name', 'A.M さん', 'role', '30 代 / 会社員', 'comment', '初めての利用でしたが、何かを話さなければ、と焦らずに済みました。誰かに「ここにいていい」と言ってもらえた時間でした。', 'rating', 5),
    jsonb_build_object('name', 'K.T さん', 'role', '40 代 / フリーランス', 'comment', '解決のためではなく、整理のための場所でした。話しているうちに、自分が本当に困っていたのは別のことだと気づけました。', 'rating', 5),
    jsonb_build_object('name', 'S.R さん', 'role', '20 代 / 学生', 'comment', 'ジャーナルが残るのが嬉しいです。一週間後の自分が読むと、確かに何かが動いていることが分かります。', 'rating', 4)
  )
),
published_props = jsonb_build_object(
  'eyebrow', 'Voices',
  'heading', '言葉になった気づきたち',
  'items', jsonb_build_array(
    jsonb_build_object('name', 'A.M さん', 'role', '30 代 / 会社員', 'comment', '初めての利用でしたが、何かを話さなければ、と焦らずに済みました。誰かに「ここにいていい」と言ってもらえた時間でした。', 'rating', 5),
    jsonb_build_object('name', 'K.T さん', 'role', '40 代 / フリーランス', 'comment', '解決のためではなく、整理のための場所でした。話しているうちに、自分が本当に困っていたのは別のことだと気づけました。', 'rating', 5),
    jsonb_build_object('name', 'S.R さん', 'role', '20 代 / 学生', 'comment', 'ジャーナルが残るのが嬉しいです。一週間後の自分が読むと、確かに何かが動いていることが分かります。', 'rating', 4)
  )
),
updated_at = NOW()
WHERE page_key='home' AND section_type='testimonials';

-- 5. gallery: 日本の余白美 (障子・茶碗・墨・苔)
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'eyebrow', 'Quiet moments',
  'heading', '日々の余白に、もう一度。',
  'subheading', '言葉にならないもの、まだ形にならないもの。それらが息をする時間を。',
  'items', jsonb_build_array(
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80&auto=format&fit=crop', 'alt', '和茶碗を持つ手'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1474524955719-b9f87c50ce47?w=800&q=80&auto=format&fit=crop', 'alt', '湖の朝霧'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80&auto=format&fit=crop', 'alt', '苔と水'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=800&q=80&auto=format&fit=crop', 'alt', '和紙と筆'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop', 'alt', '本と窓辺'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&auto=format&fit=crop', 'alt', '障子の光'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=800&q=80&auto=format&fit=crop', 'alt', '花の影'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=800&q=80&auto=format&fit=crop', 'alt', '月夜')
  )
),
published_props = jsonb_build_object(
  'eyebrow', 'Quiet moments',
  'heading', '日々の余白に、もう一度。',
  'subheading', '言葉にならないもの、まだ形にならないもの。それらが息をする時間を。',
  'items', jsonb_build_array(
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80&auto=format&fit=crop', 'alt', '和茶碗を持つ手'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1474524955719-b9f87c50ce47?w=800&q=80&auto=format&fit=crop', 'alt', '湖の朝霧'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80&auto=format&fit=crop', 'alt', '苔と水'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=800&q=80&auto=format&fit=crop', 'alt', '和紙と筆'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop', 'alt', '本と窓辺'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&auto=format&fit=crop', 'alt', '障子の光'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=800&q=80&auto=format&fit=crop', 'alt', '花の影'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=800&q=80&auto=format&fit=crop', 'alt', '月夜')
  )
),
updated_at = NOW()
WHERE page_key='home' AND section_type='gallery';

-- 6. cta_banner: 日本庭園の静謐
UPDATE public.landing_sections
SET draft_props     = jsonb_set(draft_props,     '{bg_image_url}', to_jsonb('https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&q=80&auto=format&fit=crop'::text)),
    published_props = jsonb_set(published_props, '{bg_image_url}', to_jsonb('https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&q=80&auto=format&fit=crop'::text)),
    updated_at      = NOW()
WHERE page_key='home' AND section_type='cta_banner';
