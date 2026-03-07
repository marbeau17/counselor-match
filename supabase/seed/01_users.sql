-- =============================================================================
-- 01_users.sql - Seed auth users and profiles
-- Platform: カウンセラーマッチ (Counselor Match)
-- Operator: 合同会社AICREO NEXT
-- Founder:  小林由起子 (harmony-mc.com)
--
-- Fixed UUIDs:
--   Admin:      a0000000-0000-0000-0000-000000000001
--   Counselors: c0000000-0000-0000-0000-000000000001 ~ c0000000-0000-0000-0000-000000000006
--
-- The handle_new_user() trigger auto-creates a profiles row for each
-- auth.users INSERT, so we only need to UPDATE profiles afterwards.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Admin: 小林由起子 (Founder / CEO)
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'yukiko@aicreonext.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "小林由起子"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET role         = 'admin',
    display_name = '小林由起子',
    phone        = '03-1234-5678'
WHERE id = 'a0000000-0000-0000-0000-000000000001';

-- ---------------------------------------------------------------------------
-- Counselor 1: 田中美咲 (Tanaka Misaki) - Master
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'misaki.tanaka@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "田中美咲"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET role         = 'counselor',
    display_name = '田中美咲',
    phone        = '090-1111-0001'
WHERE id = 'c0000000-0000-0000-0000-000000000001';

INSERT INTO counselors (
  user_id, level, title, bio, specialties, certifications,
  hourly_rate, is_active, rating_average, rating_count, session_count,
  methodology, available_session_types, commission_rate
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'master',
  'ホリスティック心理カウンセラー・マスター認定',
  '15年以上のカウンセリング経験を持ち、心と体の両面からクライアントの回復をサポートしています。' ||
  'スピリチュアルケアとトラウマ療法を統合した独自のアプローチで、深い癒しと自己変容を促します。' ||
  'グリーフケアの専門家としても活動しており、大切な方を失った悲しみに寄り添いながら、再び前を向く力を取り戻すお手伝いをしています。' ||
  '安心できる空間の中で、あなた自身のペースで心の声に耳を傾けていきましょう。',
  ARRAY['ホリスティック心理学', 'スピリチュアルケア', 'トラウマ', 'グリーフケア'],
  ARRAY['ホリスティック心理カウンセラー マスター認定', '臨床心理士', 'グリーフケア・アドバイザー1級'],
  12000,
  true,
  4.92,
  87,
  420,
  ARRAY['ホリスティック・アプローチ', 'EMDR', 'ナラティブセラピー', 'マインドフルネス'],
  ARRAY['online', 'phone']::session_type[],
  0.20
);

-- ---------------------------------------------------------------------------
-- Counselor 2: 鈴木健太 (Suzuki Kenta) - Senior
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'c0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'kenta.suzuki@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "鈴木健太"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET role         = 'counselor',
    display_name = '鈴木健太',
    phone        = '090-1111-0002'
WHERE id = 'c0000000-0000-0000-0000-000000000002';

INSERT INTO counselors (
  user_id, level, title, bio, specialties, certifications,
  hourly_rate, is_active, rating_average, rating_count, session_count,
  methodology, available_session_types, commission_rate
) VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'senior',
  'キャリア・ストレスマネジメント専門カウンセラー',
  '企業での人事経験を活かし、キャリアの悩みや職場のストレスに特化したカウンセリングを行っています。' ||
  '転職・昇進・人間関係のトラブルなど、働く方々が直面するさまざまな課題に10年以上向き合ってきました。' ||
  '認知行動療法をベースに、実践的なストレス対処法をお伝えしながら、ご自身の強みを再発見するサポートをいたします。' ||
  '一人で抱え込まず、まずはお気軽にお話しください。',
  ARRAY['キャリア', 'ストレス・不安', '人間関係'],
  ARRAY['産業カウンセラー', 'キャリアコンサルタント（国家資格）', 'メンタルヘルス・マネジメント検定I種'],
  9000,
  true,
  4.78,
  53,
  280,
  ARRAY['認知行動療法（CBT）', 'コーチング', 'ソリューション・フォーカスト・アプローチ'],
  ARRAY['online', 'chat', 'phone']::session_type[],
  0.22
);

-- ---------------------------------------------------------------------------
-- Counselor 3: 山本あかり (Yamamoto Akari) - Regular
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'c0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'akari.yamamoto@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "山本あかり"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET role         = 'counselor',
    display_name = '山本あかり',
    phone        = '090-1111-0003'
WHERE id = 'c0000000-0000-0000-0000-000000000003';

INSERT INTO counselors (
  user_id, level, title, bio, specialties, certifications,
  hourly_rate, is_active, rating_average, rating_count, session_count,
  methodology, available_session_types, commission_rate
) VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'regular',
  '家族・人間関係カウンセラー',
  '夫婦関係や親子の悩み、家庭内のコミュニケーション改善を中心にカウンセリングを行っています。' ||
  '7年間の相談援助の経験を通じて、家族それぞれの立場に寄り添いながら、より良い関係づくりをお手伝いしてきました。' ||
  '子育て中のお母さん・お父さんの孤立感や不安にも丁寧に向き合い、日常に活かせる具体的なヒントをお伝えしています。' ||
  '家族のかたちは一つひとつ違うからこそ、あなたの家族に合った解決策を一緒に探していきましょう。',
  ARRAY['人間関係', '家族・夫婦', '子育て'],
  ARRAY['家族相談士', '保育士', 'ペアレント・トレーニング修了'],
  7000,
  true,
  4.65,
  31,
  145,
  ARRAY['家族療法', 'ペアレント・トレーニング', '来談者中心療法'],
  ARRAY['online', 'chat']::session_type[],
  0.25
);

-- ---------------------------------------------------------------------------
-- Counselor 4: 佐藤龍一 (Sato Ryuichi) - Regular
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'c0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'ryuichi.sato@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "佐藤龍一"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET role         = 'counselor',
    display_name = '佐藤龍一',
    phone        = '090-1111-0004'
WHERE id = 'c0000000-0000-0000-0000-000000000004';

INSERT INTO counselors (
  user_id, level, title, bio, specialties, certifications,
  hourly_rate, is_active, rating_average, rating_count, session_count,
  methodology, available_session_types, commission_rate
) VALUES (
  'c0000000-0000-0000-0000-000000000004',
  'regular',
  'スピリチュアル・自己成長カウンセラー',
  '瞑想指導やスピリチュアルカウンセリングを通じて、心の奥深くにある本来の自分とつながるサポートをしています。' ||
  'うつや気分の落ち込みを経験された方に対しても、スピリチュアルな視点と心理学的アプローチの両面からケアを提供しています。' ||
  '8年間のカウンセリング活動の中で、自己成長を求める多くの方々の「気づき」と「変容」に立ち会ってきました。' ||
  'あなたの内なる力を信じ、一歩ずつ自分らしい人生を歩み始めるお手伝いをさせてください。',
  ARRAY['スピリチュアル', '自己成長', 'うつ・気分障害'],
  ARRAY['スピリチュアルケア師', '瞑想指導者認定', 'メンタル心理カウンセラー'],
  7500,
  true,
  4.71,
  28,
  130,
  ARRAY['トランスパーソナル心理学', '瞑想・マインドフルネス', 'ユング心理学'],
  ARRAY['online', 'phone']::session_type[],
  0.25
);

-- ---------------------------------------------------------------------------
-- Counselor 5: 中村彩花 (Nakamura Ayaka) - Starter
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'c0000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'ayaka.nakamura@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "中村彩花"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET role         = 'counselor',
    display_name = '中村彩花',
    phone        = '090-1111-0005'
WHERE id = 'c0000000-0000-0000-0000-000000000005';

INSERT INTO counselors (
  user_id, level, title, bio, specialties, certifications,
  hourly_rate, is_active, rating_average, rating_count, session_count,
  methodology, available_session_types, commission_rate
) VALUES (
  'c0000000-0000-0000-0000-000000000005',
  'starter',
  '心理カウンセラー（ストレス・不安ケア）',
  '大学院で臨床心理学を学んだ後、不安障害やうつ症状に悩む方のサポートを中心に活動を始めました。' ||
  'まだ経験年数は浅いですが、一人ひとりの気持ちに丁寧に寄り添い、安心して話せる場をつくることを大切にしています。' ||
  '認知行動療法やマインドフルネスを取り入れ、日常生活の中で実践できるセルフケアの方法もお伝えしています。' ||
  '「こんなことで相談していいのかな」と思う方こそ、ぜひ一度お話しにいらしてください。',
  ARRAY['ストレス・不安', 'うつ・気分障害', '自己成長'],
  ARRAY['認定心理士', 'メンタルヘルス・マネジメント検定II種'],
  5000,
  true,
  4.50,
  12,
  38,
  ARRAY['認知行動療法（CBT）', 'マインドフルネス', 'セルフ・コンパッション'],
  ARRAY['online', 'chat']::session_type[],
  0.25
);

-- ---------------------------------------------------------------------------
-- Counselor 6: 伊藤大和 (Ito Yamato) - Starter
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'c0000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'yamato.ito@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "伊藤大和"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET role         = 'counselor',
    display_name = '伊藤大和',
    phone        = '090-1111-0006'
WHERE id = 'c0000000-0000-0000-0000-000000000006';

INSERT INTO counselors (
  user_id, level, title, bio, specialties, certifications,
  hourly_rate, is_active, rating_average, rating_count, session_count,
  methodology, available_session_types, commission_rate
) VALUES (
  'c0000000-0000-0000-0000-000000000006',
  'starter',
  'キャリア・若者支援カウンセラー',
  '大学のキャリアセンターでの勤務経験を活かし、若い世代の就職・転職・キャリア形成の悩みに寄り添っています。' ||
  '「自分に何が向いているのか分からない」「将来が不安」といったモヤモヤした気持ちを整理し、具体的な一歩を踏み出すお手伝いをします。' ||
  '人間関係や自己成長の相談にも対応しており、社会に出たばかりの方の心の支えになれればと考えています。' ||
  '堅苦しくない雰囲気で、友人に話すような感覚でお気軽にご相談ください。',
  ARRAY['キャリア', '自己成長', '人間関係'],
  ARRAY['キャリアコンサルタント（国家資格）', 'メンタル心理カウンセラー'],
  5000,
  true,
  4.40,
  8,
  22,
  ARRAY['キャリアカウンセリング', 'コーチング', 'ナラティブ・アプローチ'],
  ARRAY['online', 'chat', 'phone']::session_type[],
  0.25
);
