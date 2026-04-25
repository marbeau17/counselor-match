-- =============================================================================
-- 20260426000002_landing_redesign.sql
-- LP 全面刷新 (warm パレット + serif + ナラティブ)
-- spec: docs/lp_redesign_spec.md
-- =============================================================================

-- 1. trust_bar を非表示に (情報は features 内に統合済み)
UPDATE public.landing_sections
SET is_visible = false, updated_at = NOW()
WHERE page_key = 'home' AND section_type = 'trust_bar';

-- 2. story_narrative セクション追加 (Hero 直後 sort_order=15)
INSERT INTO public.landing_sections (page_key, section_type, sort_order, is_visible, draft_props, published_props, published_at, created_at, updated_at)
SELECT 'home', 'story_narrative', 15, TRUE,
  jsonb_build_object(
    'eyebrow', 'Why we exist',
    'heading', '急かされない場所で、誰かに、ゆっくり聞いてほしい。',
    'paragraphs', jsonb_build_array(
      '何かを変えるためでなく、ただ自分の輪郭を確かめるために。カウンセリングは、特別なことが起きた人のものではありません。日々の中で少しずつ硬くなる呼吸を、もう一度ほどく時間です。',
      '私たちは、判断ではなく対話を、技法ではなく関係性を、ゴールではなく道のりを大切にする伴走者を集めています。',
      'あなたが今この場所にたどり着いたこと自体、すでに一歩です。何も決めなくていいので、まずは少しだけ、立ち止まってみませんか。'
    ),
    'signature', 'カウンセラーマッチ 編集部より'
  ),
  jsonb_build_object(
    'eyebrow', 'Why we exist',
    'heading', '急かされない場所で、誰かに、ゆっくり聞いてほしい。',
    'paragraphs', jsonb_build_array(
      '何かを変えるためでなく、ただ自分の輪郭を確かめるために。カウンセリングは、特別なことが起きた人のものではありません。日々の中で少しずつ硬くなる呼吸を、もう一度ほどく時間です。',
      '私たちは、判断ではなく対話を、技法ではなく関係性を、ゴールではなく道のりを大切にする伴走者を集めています。',
      'あなたが今この場所にたどり着いたこと自体、すでに一歩です。何も決めなくていいので、まずは少しだけ、立ち止まってみませんか。'
    ),
    'signature', 'カウンセラーマッチ 編集部より'
  ),
  NOW(), NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.landing_sections WHERE page_key='home' AND section_type='story_narrative'
);

-- 3. hero リデザイン (人物写真 split layout)
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'accent_label', 'Holistic Counseling',
  'headline', E'「整える」ではなく、\n「ほどく」時間を。',
  'subheadline', E'急かされない場所で、誰かに、ゆっくり聞いてほしい――。\nホリスティック心理学に根ざした、伴走型のカウンセリング。',
  'cta_label', '静かに話せる人を探す',
  'cta_url', '/counselors',
  'sub_cta_label', 'まずは無料で診断してみる',
  'sub_cta_url', '/tools/personality',
  'photo_url', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80&auto=format&fit=crop',
  'photo_alt', '窓辺で本を読む人物'
),
published_props = jsonb_build_object(
  'accent_label', 'Holistic Counseling',
  'headline', E'「整える」ではなく、\n「ほどく」時間を。',
  'subheadline', E'急かされない場所で、誰かに、ゆっくり聞いてほしい――。\nホリスティック心理学に根ざした、伴走型のカウンセリング。',
  'cta_label', '静かに話せる人を探す',
  'cta_url', '/counselors',
  'sub_cta_label', 'まずは無料で診断してみる',
  'sub_cta_url', '/tools/personality',
  'photo_url', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80&auto=format&fit=crop',
  'photo_alt', '窓辺で本を読む人物'
),
updated_at = NOW()
WHERE page_key='home' AND section_type='hero';

-- 4. features 改題 + 人間味のあるコピー + 具体ディテール画像
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'eyebrow', 'Three commitments',
  'heading', '3 つの、大切にしていること',
  'columns', 3,
  'items', jsonb_build_array(
    jsonb_build_object('title', '聴くこと', 'body', '解決を急がずに、まず理解する。あなたの言葉のリズムや沈黙そのものを大切にします。', 'image_url', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('title', '映すこと', 'body', '関係性を鏡として、自分の内側に出会う。気づきは、対話の中でゆっくりと立ち上がります。', 'image_url', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('title', '守ること', 'body', '守秘・誠実さ・専門性で、対話の場そのものを支えます。安心して、ほどけてください。', 'image_url', 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80&auto=format&fit=crop')
  )
),
published_props = jsonb_build_object(
  'eyebrow', 'Three commitments',
  'heading', '3 つの、大切にしていること',
  'columns', 3,
  'items', jsonb_build_array(
    jsonb_build_object('title', '聴くこと', 'body', '解決を急がずに、まず理解する。あなたの言葉のリズムや沈黙そのものを大切にします。', 'image_url', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('title', '映すこと', 'body', '関係性を鏡として、自分の内側に出会う。気づきは、対話の中でゆっくりと立ち上がります。', 'image_url', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('title', '守ること', 'body', '守秘・誠実さ・専門性で、対話の場そのものを支えます。安心して、ほどけてください。', 'image_url', 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80&auto=format&fit=crop')
  )
),
updated_at = NOW()
WHERE page_key='home' AND section_type='features';

-- 5. gallery 「日々の余白に」
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'eyebrow', 'Quiet moments',
  'heading', '日々の余白に、もう一度。',
  'subheading', '言葉にならないもの、まだ形にならないもの。それらが息をする時間を。',
  'items', jsonb_build_array(
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop', 'alt', '手で湯気を包む朝'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1474524955719-b9f87c50ce47?w=800&q=80&auto=format&fit=crop', 'alt', '湖の朝霧'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80&auto=format&fit=crop', 'alt', '苔と水'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80&auto=format&fit=crop', 'alt', '砂と石'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop', 'alt', '本と窓辺'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80&auto=format&fit=crop', 'alt', '一輪挿し'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=800&q=80&auto=format&fit=crop', 'alt', '花の影'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=800&q=80&auto=format&fit=crop', 'alt', '月夜')
  )
),
published_props = jsonb_build_object(
  'eyebrow', 'Quiet moments',
  'heading', '日々の余白に、もう一度。',
  'subheading', '言葉にならないもの、まだ形にならないもの。それらが息をする時間を。',
  'items', jsonb_build_array(
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop', 'alt', '手で湯気を包む朝'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1474524955719-b9f87c50ce47?w=800&q=80&auto=format&fit=crop', 'alt', '湖の朝霧'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80&auto=format&fit=crop', 'alt', '苔と水'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1455218873509-8097305ee378?w=800&q=80&auto=format&fit=crop', 'alt', '砂と石'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop', 'alt', '本と窓辺'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80&auto=format&fit=crop', 'alt', '一輪挿し'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=800&q=80&auto=format&fit=crop', 'alt', '花の影'),
    jsonb_build_object('image_url', 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=800&q=80&auto=format&fit=crop', 'alt', '月夜')
  )
),
updated_at = NOW()
WHERE page_key='home' AND section_type='gallery';

-- 6. how_it_works ナラティブ化 + 改題
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'eyebrow', 'Your journey',
  'heading', '対話までの、ゆっくりとした 4 ステップ',
  'items', jsonb_build_array(
    jsonb_build_object('step', 1, 'title', '静かに探す', 'body', '今の自分に合いそうな人を、テーマや言葉の温度から絞り込みます。', 'image_url', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 2, 'title', '声に触れる', 'body', 'プロフィールや受け手の声から、その人の「在り方」を確かめます。', 'image_url', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 3, 'title', '対話する', 'body', 'オンラインの落ち着いた時間で、ただ話す、ただ聴いてもらう。', 'image_url', 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 4, 'title', '書き残す', 'body', '気づきをジャーナルに置いておく。次の自分が読み返せるように。', 'image_url', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80&auto=format&fit=crop')
  )
),
published_props = jsonb_build_object(
  'eyebrow', 'Your journey',
  'heading', '対話までの、ゆっくりとした 4 ステップ',
  'items', jsonb_build_array(
    jsonb_build_object('step', 1, 'title', '静かに探す', 'body', '今の自分に合いそうな人を、テーマや言葉の温度から絞り込みます。', 'image_url', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 2, 'title', '声に触れる', 'body', 'プロフィールや受け手の声から、その人の「在り方」を確かめます。', 'image_url', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 3, 'title', '対話する', 'body', 'オンラインの落ち着いた時間で、ただ話す、ただ聴いてもらう。', 'image_url', 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=600&q=80&auto=format&fit=crop'),
    jsonb_build_object('step', 4, 'title', '書き残す', 'body', '気づきをジャーナルに置いておく。次の自分が読み返せるように。', 'image_url', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80&auto=format&fit=crop')
  )
),
updated_at = NOW()
WHERE page_key='home' AND section_type='how_it_works';

-- 7. tools_promo (静物画像 + 微改コピー)
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'items', jsonb_build_array(
    jsonb_build_object('href', '/tools/personality', 'icon', 'BookHeart', 'title', 'パーソナリティ診断', 'body', '32タイプの性格構造から、今の自分の在り方を内省する。', 'image_url', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('href', '/tools/tarot', 'icon', 'Sparkles', 'title', 'タロット・リフレクション', 'body', 'カードを通じて、いま向き合うべきテーマを見つめ直す。', 'image_url', 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('href', '/tools/compatibility', 'icon', 'Heart', 'title', '相性診断', 'body', '関係性の相互作用を、構造として静かに眺める。', 'image_url', 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80&auto=format&fit=crop')
  )
),
published_props = jsonb_build_object(
  'items', jsonb_build_array(
    jsonb_build_object('href', '/tools/personality', 'icon', 'BookHeart', 'title', 'パーソナリティ診断', 'body', '32タイプの性格構造から、今の自分の在り方を内省する。', 'image_url', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('href', '/tools/tarot', 'icon', 'Sparkles', 'title', 'タロット・リフレクション', 'body', 'カードを通じて、いま向き合うべきテーマを見つめ直す。', 'image_url', 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=800&q=80&auto=format&fit=crop'),
    jsonb_build_object('href', '/tools/compatibility', 'icon', 'Heart', 'title', '相性診断', 'body', '関係性の相互作用を、構造として静かに眺める。', 'image_url', 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80&auto=format&fit=crop')
  )
),
updated_at = NOW()
WHERE page_key='home' AND section_type='tools_promo';

-- 8. testimonials (引用化 + 後ろ姿)
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'eyebrow', 'Voices',
  'heading', '言葉になった気づきたち',
  'items', jsonb_build_array(
    jsonb_build_object('name', 'A.M さん', 'role', '30 代 / 会社員', 'comment', '初めての利用でしたが、何かを話さなければ、と焦らずに済みました。誰かに「ここにいていい」と言ってもらえた時間でした。', 'rating', 5, 'avatar_url', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop&crop=faces'),
    jsonb_build_object('name', 'K.T さん', 'role', '40 代 / フリーランス', 'comment', '解決のためではなく、整理のための場所でした。話しているうちに、自分が本当に困っていたのは別のことだと気づけました。', 'rating', 5, 'avatar_url', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop&crop=faces'),
    jsonb_build_object('name', 'S.R さん', 'role', '20 代 / 学生', 'comment', 'ジャーナルが残るのが嬉しいです。一週間後の自分が読むと、確かに何かが動いていることが分かります。', 'rating', 4, 'avatar_url', 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&q=80&auto=format&fit=crop&crop=faces')
  )
),
published_props = jsonb_build_object(
  'eyebrow', 'Voices',
  'heading', '言葉になった気づきたち',
  'items', jsonb_build_array(
    jsonb_build_object('name', 'A.M さん', 'role', '30 代 / 会社員', 'comment', '初めての利用でしたが、何かを話さなければ、と焦らずに済みました。誰かに「ここにいていい」と言ってもらえた時間でした。', 'rating', 5, 'avatar_url', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop&crop=faces'),
    jsonb_build_object('name', 'K.T さん', 'role', '40 代 / フリーランス', 'comment', '解決のためではなく、整理のための場所でした。話しているうちに、自分が本当に困っていたのは別のことだと気づけました。', 'rating', 5, 'avatar_url', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop&crop=faces'),
    jsonb_build_object('name', 'S.R さん', 'role', '20 代 / 学生', 'comment', 'ジャーナルが残るのが嬉しいです。一週間後の自分が読むと、確かに何かが動いていることが分かります。', 'rating', 4, 'avatar_url', 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&q=80&auto=format&fit=crop&crop=faces')
  )
),
updated_at = NOW()
WHERE page_key='home' AND section_type='testimonials';

-- 9. cta_banner 控えめに
UPDATE public.landing_sections
SET draft_props = jsonb_build_object(
  'eyebrow', 'Begin softly',
  'headline', E'始めるためでなく、\nまず立ち止まるために。',
  'subheadline', '無料登録で 1,000 円分のお試しポイント。気が向いたら、ゆっくり使ってください。',
  'cta_label', 'まず登録して見てみる',
  'cta_url', '/register',
  'bg_image_url', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1920&q=80&auto=format&fit=crop'
),
published_props = jsonb_build_object(
  'eyebrow', 'Begin softly',
  'headline', E'始めるためでなく、\nまず立ち止まるために。',
  'subheadline', '無料登録で 1,000 円分のお試しポイント。気が向いたら、ゆっくり使ってください。',
  'cta_label', 'まず登録して見てみる',
  'cta_url', '/register',
  'bg_image_url', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1920&q=80&auto=format&fit=crop'
),
updated_at = NOW()
WHERE page_key='home' AND section_type='cta_banner';
