-- ============================================================
-- カウンセラーマッチ シードデータ
-- 実行方法: Supabase SQL Editor にコピー＆ペーストして実行
-- ============================================================
-- 注意: このスクリプトは 00001_initial_schema.sql の実行後に実行してください
-- パスワードは全ユーザー共通: Test1234!
-- ============================================================

BEGIN;

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

-- ============================================================
-- クライアントユーザー
-- ============================================================

-- =============================================================================
-- 02_clients.sql - Seed client users (people who book counseling sessions)
-- Platform: カウンセラーマッチ (Counselor Match)
-- Operator: 合同会社AICREO NEXT
-- Founder:  小林由起子 (harmony-mc.com)
--
-- Fixed UUIDs:
--   Clients: d0000000-0000-0000-0000-000000000001 ~ d0000000-0000-0000-0000-000000000008
--
-- The handle_new_user() trigger auto-creates a profiles row for each
-- auth.users INSERT, so we only need to UPDATE profiles afterwards.
-- Role defaults to 'client' so we just set display_name and phone.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Client 1: 高橋優花 (Takahashi Yuka) - 20代女性、ストレス悩み
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'd0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'yuka.takahashi@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "高橋優花"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET display_name = '高橋優花',
    phone        = '090-2222-0001'
WHERE id = 'd0000000-0000-0000-0000-000000000001';

-- ---------------------------------------------------------------------------
-- Client 2: 渡辺翔太 (Watanabe Shota) - 30代男性、キャリア相談
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'd0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'shota.watanabe@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "渡辺翔太"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET display_name = '渡辺翔太',
    phone        = '090-2222-0002'
WHERE id = 'd0000000-0000-0000-0000-000000000002';

-- ---------------------------------------------------------------------------
-- Client 3: 木村さくら (Kimura Sakura) - 40代女性、家族関係
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'd0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'sakura.kimura@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "木村さくら"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET display_name = '木村さくら',
    phone        = '090-2222-0003'
WHERE id = 'd0000000-0000-0000-0000-000000000003';

-- ---------------------------------------------------------------------------
-- Client 4: 加藤大輝 (Kato Daiki) - 30代男性、自己成長
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'd0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'daiki.kato@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "加藤大輝"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET display_name = '加藤大輝',
    phone        = '090-2222-0004'
WHERE id = 'd0000000-0000-0000-0000-000000000004';

-- ---------------------------------------------------------------------------
-- Client 5: 吉田美月 (Yoshida Mizuki) - 20代女性、トラウマケア
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'd0000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'mizuki.yoshida@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "吉田美月"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET display_name = '吉田美月',
    phone        = '090-2222-0005'
WHERE id = 'd0000000-0000-0000-0000-000000000005';

-- ---------------------------------------------------------------------------
-- Client 6: 松本悠人 (Matsumoto Yuto) - 50代男性、うつ
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'd0000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'yuto.matsumoto@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "松本悠人"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET display_name = '松本悠人',
    phone        = '090-2222-0006'
WHERE id = 'd0000000-0000-0000-0000-000000000006';

-- ---------------------------------------------------------------------------
-- Client 7: 井上花音 (Inoue Kanon) - 30代女性、スピリチュアル
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'd0000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000000',
  'kanon.inoue@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "井上花音"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET display_name = '井上花音',
    phone        = '090-2222-0007'
WHERE id = 'd0000000-0000-0000-0000-000000000007';

-- ---------------------------------------------------------------------------
-- Client 8: 小川蓮 (Ogawa Ren) - 20代男性、人間関係
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, confirmation_token, aud, role
) VALUES (
  'd0000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000000',
  'ren.ogawa@example.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"full_name": "小川蓮"}'::jsonb,
  NOW(), NOW(), '', 'authenticated', 'authenticated'
);

UPDATE profiles
SET display_name = '小川蓮',
    phone        = '090-2222-0008'
WHERE id = 'd0000000-0000-0000-0000-000000000008';

-- ============================================================
-- 予約データ
-- ============================================================

-- =============================================================================
-- 03_bookings.sql - Seed booking records
-- Platform: カウンセラーマッチ (Counselor Match)
-- Operator: 合同会社AICREO NEXT
-- Founder:  小林由起子 (harmony-mc.com)
--
-- Fixed UUIDs:
--   Bookings: b0000000-0000-0000-0000-000000000001 ~ b0000000-0000-0000-0000-000000000018
--
-- Counselor IDs are looked up from counselors.user_id because the counselors
-- table uses uuid_generate_v4() for its primary key (not fixed in 01_users.sql).
--
-- Client UUIDs (profiles.id = auth.users.id):
--   d0000000-0000-0000-0000-000000000001  高橋優花
--   d0000000-0000-0000-0000-000000000002  渡辺翔太
--   d0000000-0000-0000-0000-000000000003  木村さくら
--   d0000000-0000-0000-0000-000000000004  加藤大輝
--   d0000000-0000-0000-0000-000000000005  吉田美月
--   d0000000-0000-0000-0000-000000000006  松本悠人
--   d0000000-0000-0000-0000-000000000007  井上花音
--   d0000000-0000-0000-0000-000000000008  小川蓮
--
-- Counselor user_ids (used in subquery to resolve counselors.id):
--   c0000000-0000-0000-0000-000000000001  田中美咲  (master,  ¥12,000)
--   c0000000-0000-0000-0000-000000000002  鈴木健太  (senior,  ¥9,000)
--   c0000000-0000-0000-0000-000000000003  山本あかり (regular, ¥7,000)
--   c0000000-0000-0000-0000-000000000004  佐藤龍一  (regular, ¥7,500)
--   c0000000-0000-0000-0000-000000000005  中村彩花  (starter, ¥5,000)
--   c0000000-0000-0000-0000-000000000006  伊藤大和  (starter, ¥5,000)
--
-- Status distribution:
--   completed  (4) - past sessions, 2026-01 ~ 2026-02
--   confirmed  (4) - upcoming sessions, 2026-03-10 ~ 2026-03-20
--   pending    (3) - requested sessions, 2026-03-15 ~ 2026-03-25
--   cancelled  (2) - cancelled sessions
--
-- Price = counselor's hourly_rate (50-minute session billed at hourly rate)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- COMPLETED sessions (past dates, 2026-01 to 2026-02)
-- ---------------------------------------------------------------------------

-- Booking 1: 高橋優花 × 鈴木健太 — キャリアストレス相談（completed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000002'),
  'online',
  'completed',
  '2026-01-10 10:00:00+09',
  50,
  9000,
  '仕事のプレッシャーが続いていて、眠れない日が増えています。ストレスの対処法を教えていただきたいです。',
  '2026-01-05 14:30:00+09',
  '2026-01-10 11:00:00+09'
);

-- Booking 2: 木村さくら × 山本あかり — 夫婦関係の悩み（completed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000003'),
  'online',
  'completed',
  '2026-01-18 14:00:00+09',
  50,
  7000,
  '夫との会話が減り、家庭内の雰囲気がぎこちなくなっています。関係を改善するヒントが欲しいです。',
  '2026-01-12 09:00:00+09',
  '2026-01-18 15:00:00+09'
);

-- Booking 3: 吉田美月 × 田中美咲 — トラウマケア初回（completed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000005',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  'online',
  'completed',
  '2026-02-05 11:00:00+09',
  50,
  12000,
  '過去のつらい経験がフラッシュバックすることがあり、日常生活に支障が出ています。安心して話せる場を探しています。',
  '2026-01-28 16:00:00+09',
  '2026-02-05 12:00:00+09'
);

-- Booking 4: 渡辺翔太 × 鈴木健太 — 転職相談（completed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000002',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000002'),
  'phone',
  'completed',
  '2026-02-14 19:00:00+09',
  50,
  9000,
  '現在の職場に将来性を感じられず、転職を考えています。自分の強みを整理して次のステップを考えたいです。',
  '2026-02-08 10:00:00+09',
  '2026-02-14 20:00:00+09'
);

-- ---------------------------------------------------------------------------
-- CONFIRMED sessions (upcoming, 2026-03-10 to 2026-03-20)
-- ---------------------------------------------------------------------------

-- Booking 5: 加藤大輝 × 佐藤龍一 — 自己成長・瞑想（confirmed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, meeting_url, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000005',
  'd0000000-0000-0000-0000-000000000004',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000004'),
  'online',
  'confirmed',
  '2026-03-10 10:00:00+09',
  50,
  7500,
  '瞑想を始めたいと思っていますが、一人ではなかなか続きません。ガイド付きで体験してみたいです。',
  'https://meet.example.com/session-005',
  '2026-03-03 11:00:00+09',
  '2026-03-04 09:00:00+09'
);

-- Booking 6: 吉田美月 × 田中美咲 — トラウマケア継続2回目（confirmed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, meeting_url, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000006',
  'd0000000-0000-0000-0000-000000000005',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  'online',
  'confirmed',
  '2026-03-12 11:00:00+09',
  50,
  12000,
  '前回のセッションで少し気持ちが楽になりました。引き続きEMDRのアプローチをお願いしたいです。',
  'https://meet.example.com/session-006',
  '2026-03-06 08:30:00+09',
  '2026-03-06 15:00:00+09'
);

-- Booking 7: 松本悠人 × 中村彩花 — うつ症状の相談（confirmed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, meeting_url, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000007',
  'd0000000-0000-0000-0000-000000000006',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000005'),
  'online',
  'confirmed',
  '2026-03-14 15:00:00+09',
  50,
  5000,
  '最近何をしても楽しいと感じられず、朝起きるのもつらいです。少しでも気持ちを軽くする方法を一緒に考えてほしいです。',
  'https://meet.example.com/session-007',
  '2026-03-05 20:00:00+09',
  '2026-03-06 10:00:00+09'
);

-- Booking 8: 小川蓮 × 伊藤大和 — キャリア相談・就活（confirmed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, meeting_url, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000008',
  'd0000000-0000-0000-0000-000000000008',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000006'),
  'chat',
  'confirmed',
  '2026-03-18 13:00:00+09',
  50,
  5000,
  '大学卒業後の進路に迷っています。自分に合った仕事の見つけ方についてアドバイスをいただきたいです。',
  'https://meet.example.com/session-008',
  '2026-03-07 14:00:00+09',
  '2026-03-07 18:00:00+09'
);

-- ---------------------------------------------------------------------------
-- PENDING sessions (requested, 2026-03-15 to 2026-03-25)
-- ---------------------------------------------------------------------------

-- Booking 9: 高橋優花 × 田中美咲 — ホリスティックケア初回（pending）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000009',
  'd0000000-0000-0000-0000-000000000001',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  'online',
  'pending',
  '2026-03-17 10:00:00+09',
  50,
  12000,
  '以前別のカウンセラーに相談しましたが、もっと深いレベルで心のケアをしていただきたく、田中先生にお願いしたいです。',
  '2026-03-07 09:00:00+09',
  '2026-03-07 09:00:00+09'
);

-- Booking 10: 井上花音 × 佐藤龍一 — スピリチュアルカウンセリング（pending）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000010',
  'd0000000-0000-0000-0000-000000000007',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000004'),
  'phone',
  'pending',
  '2026-03-20 16:00:00+09',
  50,
  7500,
  '自分の人生の方向性について、スピリチュアルな視点からアドバイスをいただきたいです。直感を大切にしたいと思っています。',
  '2026-03-07 12:00:00+09',
  '2026-03-07 12:00:00+09'
);

-- Booking 11: 木村さくら × 山本あかり — 子育て相談（pending）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000011',
  'd0000000-0000-0000-0000-000000000003',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000003'),
  'chat',
  'pending',
  '2026-03-25 11:00:00+09',
  50,
  7000,
  '中学生の息子が最近反抗期で、どう接していいか分からなくなっています。親としての関わり方を相談したいです。',
  '2026-03-07 15:00:00+09',
  '2026-03-07 15:00:00+09'
);

-- ---------------------------------------------------------------------------
-- CANCELLED sessions
-- ---------------------------------------------------------------------------

-- Booking 12: 渡辺翔太 × 中村彩花 — 不安相談（cancelled — 体調不良のため）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000012',
  'd0000000-0000-0000-0000-000000000002',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000005'),
  'online',
  'cancelled',
  '2026-02-20 18:00:00+09',
  50,
  5000,
  '漠然とした不安が続いています。認知行動療法に興味があり、試してみたいです。※体調不良のためキャンセルさせていただきます。',
  '2026-02-10 13:00:00+09',
  '2026-02-18 09:00:00+09'
);

-- Booking 13: 加藤大輝 × 伊藤大和 — キャリア相談（cancelled — 日程変更のため）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000013',
  'd0000000-0000-0000-0000-000000000004',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000006'),
  'chat',
  'cancelled',
  '2026-02-28 14:00:00+09',
  50,
  5000,
  '自分のキャリアプランについて相談したいです。※急な出張が入ったため、改めて予約し直します。',
  '2026-02-20 10:00:00+09',
  '2026-02-26 17:00:00+09'
);

-- ---------------------------------------------------------------------------
-- Additional bookings for richer data coverage
-- ---------------------------------------------------------------------------

-- Booking 14: 松本悠人 × 佐藤龍一 — うつ・スピリチュアルケア（completed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000014',
  'd0000000-0000-0000-0000-000000000006',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000004'),
  'phone',
  'completed',
  '2026-01-25 17:00:00+09',
  50,
  7500,
  '気分が沈む日が多く、何か心の支えになるものを見つけたいです。瞑想やスピリチュアルなアプローチに興味があります。',
  '2026-01-18 11:00:00+09',
  '2026-01-25 18:00:00+09'
);

-- Booking 15: 井上花音 × 田中美咲 — グリーフケア（completed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000015',
  'd0000000-0000-0000-0000-000000000007',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  'online',
  'completed',
  '2026-02-22 13:00:00+09',
  50,
  12000,
  '昨年、大切な家族を亡くしました。悲しみとどう向き合えばいいのか、専門の先生にお話を聞いていただきたいです。',
  '2026-02-15 09:30:00+09',
  '2026-02-22 14:00:00+09'
);

-- Booking 16: 小川蓮 × 山本あかり — 人間関係の悩み（confirmed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, meeting_url, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000016',
  'd0000000-0000-0000-0000-000000000008',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000003'),
  'online',
  'confirmed',
  '2026-03-15 10:00:00+09',
  50,
  7000,
  '友人関係がうまくいかず、孤独を感じることが増えています。コミュニケーションの取り方を見直したいです。',
  'https://meet.example.com/session-016',
  '2026-03-05 16:00:00+09',
  '2026-03-06 11:00:00+09'
);

-- Booking 17: 高橋優花 × 中村彩花 — 不安・セルフケア（pending）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000017',
  'd0000000-0000-0000-0000-000000000001',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000005'),
  'chat',
  'pending',
  '2026-03-22 20:00:00+09',
  50,
  5000,
  '仕事の後に気持ちを切り替えるのが苦手で、夜もずっと仕事のことを考えてしまいます。セルフケアの方法を学びたいです。',
  '2026-03-07 21:00:00+09',
  '2026-03-07 21:00:00+09'
);

-- Booking 18: 渡辺翔太 × 伊藤大和 — キャリア形成（confirmed）
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes, meeting_url, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000018',
  'd0000000-0000-0000-0000-000000000002',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000006'),
  'online',
  'confirmed',
  '2026-03-20 19:00:00+09',
  50,
  5000,
  '転職活動を本格的に始めるにあたり、若手の視点からキャリアの棚卸しを手伝っていただきたいです。',
  'https://meet.example.com/session-018',
  '2026-03-06 22:00:00+09',
  '2026-03-07 08:00:00+09'
);

-- ============================================================
-- 支払いデータ
-- ============================================================

-- =============================================================================
-- 04_payments.sql - Seed payment records
-- Platform: カウンセラーマッチ (Counselor Match)
-- Operator: 合同会社AICREO NEXT
-- Founder:  小林由起子 (harmony-mc.com)
--
-- Fixed UUIDs:
--   Payments: p0000000-0000-0000-0000-000000000001 ~ p0000000-0000-0000-0000-000000000018
--
-- One payment per booking, mirroring booking status:
--   completed / confirmed booking  -> payment status = 'paid'
--   pending booking                -> payment status = 'pending'
--   cancelled booking              -> payment status = 'refunded'
--
-- Platform fee = price * counselor commission_rate
-- Counselor payout = price - platform_fee
--
-- Commission rates (from 01_users.sql):
--   c001 田中美咲 (master)  0.20
--   c002 鈴木健太 (senior)  0.22
--   c003 山本あかり (regular) 0.25
--   c004 佐藤龍一 (regular) 0.25
--   c005 中村彩花 (starter) 0.25
--   c006 伊藤大和 (starter) 0.25
--
-- No counselors have stripe_account_id set in seed data, so
-- stripe_transfer_id is omitted (NULL) for all records.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PAID payments — completed bookings (past sessions)
-- ---------------------------------------------------------------------------

-- Payment 1: Booking 1 — 高橋優花 × 鈴木健太 (¥9,000, 22% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000002'),
  9000,
  1980,   -- 9000 * 0.22
  7020,   -- 9000 - 1980
  'JPY',
  'paid',
  'pi_test_booking001_completed',
  '2026-01-10 10:00:00+09'
);

-- Payment 2: Booking 2 — 木村さくら × 山本あかり (¥7,000, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000003'),
  7000,
  1750,   -- 7000 * 0.25
  5250,   -- 7000 - 1750
  'JPY',
  'paid',
  'pi_test_booking002_completed',
  '2026-01-18 14:00:00+09'
);

-- Payment 3: Booking 3 — 吉田美月 × 田中美咲 (¥12,000, 20% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000005',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  12000,
  2400,   -- 12000 * 0.20
  9600,   -- 12000 - 2400
  'JPY',
  'paid',
  'pi_test_booking003_completed',
  '2026-02-05 11:00:00+09'
);

-- Payment 4: Booking 4 — 渡辺翔太 × 鈴木健太 (¥9,000, 22% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000002',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000002'),
  9000,
  1980,   -- 9000 * 0.22
  7020,   -- 9000 - 1980
  'JPY',
  'paid',
  'pi_test_booking004_completed',
  '2026-02-14 19:00:00+09'
);

-- Payment 14: Booking 14 — 松本悠人 × 佐藤龍一 (¥7,500, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000014',
  'b0000000-0000-0000-0000-000000000014',
  'd0000000-0000-0000-0000-000000000006',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000004'),
  7500,
  1875,   -- 7500 * 0.25
  5625,   -- 7500 - 1875
  'JPY',
  'paid',
  'pi_test_booking014_completed',
  '2026-01-25 17:00:00+09'
);

-- Payment 15: Booking 15 — 井上花音 × 田中美咲 (¥12,000, 20% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000015',
  'b0000000-0000-0000-0000-000000000015',
  'd0000000-0000-0000-0000-000000000007',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  12000,
  2400,   -- 12000 * 0.20
  9600,   -- 12000 - 2400
  'JPY',
  'paid',
  'pi_test_booking015_completed',
  '2026-02-22 13:00:00+09'
);

-- ---------------------------------------------------------------------------
-- PAID payments — confirmed bookings (upcoming sessions, pre-paid)
-- ---------------------------------------------------------------------------

-- Payment 5: Booking 5 — 加藤大輝 × 佐藤龍一 (¥7,500, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000005',
  'd0000000-0000-0000-0000-000000000004',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000004'),
  7500,
  1875,   -- 7500 * 0.25
  5625,   -- 7500 - 1875
  'JPY',
  'paid',
  'pi_test_booking005_confirmed',
  '2026-03-04 09:00:00+09'
);

-- Payment 6: Booking 6 — 吉田美月 × 田中美咲 (¥12,000, 20% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000006',
  'd0000000-0000-0000-0000-000000000005',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  12000,
  2400,   -- 12000 * 0.20
  9600,   -- 12000 - 2400
  'JPY',
  'paid',
  'pi_test_booking006_confirmed',
  '2026-03-06 15:00:00+09'
);

-- Payment 7: Booking 7 — 松本悠人 × 中村彩花 (¥5,000, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000007',
  'b0000000-0000-0000-0000-000000000007',
  'd0000000-0000-0000-0000-000000000006',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000005'),
  5000,
  1250,   -- 5000 * 0.25
  3750,   -- 5000 - 1250
  'JPY',
  'paid',
  'pi_test_booking007_confirmed',
  '2026-03-06 10:00:00+09'
);

-- Payment 8: Booking 8 — 小川蓮 × 伊藤大和 (¥5,000, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000008',
  'b0000000-0000-0000-0000-000000000008',
  'd0000000-0000-0000-0000-000000000008',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000006'),
  5000,
  1250,   -- 5000 * 0.25
  3750,   -- 5000 - 1250
  'JPY',
  'paid',
  'pi_test_booking008_confirmed',
  '2026-03-07 18:00:00+09'
);

-- Payment 16: Booking 16 — 小川蓮 × 山本あかり (¥7,000, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000016',
  'b0000000-0000-0000-0000-000000000016',
  'd0000000-0000-0000-0000-000000000008',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000003'),
  7000,
  1750,   -- 7000 * 0.25
  5250,   -- 7000 - 1750
  'JPY',
  'paid',
  'pi_test_booking016_confirmed',
  '2026-03-06 11:00:00+09'
);

-- Payment 18: Booking 18 — 渡辺翔太 × 伊藤大和 (¥5,000, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000018',
  'b0000000-0000-0000-0000-000000000018',
  'd0000000-0000-0000-0000-000000000002',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000006'),
  5000,
  1250,   -- 5000 * 0.25
  3750,   -- 5000 - 1250
  'JPY',
  'paid',
  'pi_test_booking018_confirmed',
  '2026-03-07 08:00:00+09'
);

-- ---------------------------------------------------------------------------
-- PENDING payments — pending bookings (awaiting confirmation)
-- ---------------------------------------------------------------------------

-- Payment 9: Booking 9 — 高橋優花 × 田中美咲 (¥12,000, 20% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000009',
  'b0000000-0000-0000-0000-000000000009',
  'd0000000-0000-0000-0000-000000000001',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  12000,
  2400,   -- 12000 * 0.20
  9600,   -- 12000 - 2400
  'JPY',
  'pending',
  '2026-03-07 09:00:00+09'
);

-- Payment 10: Booking 10 — 井上花音 × 佐藤龍一 (¥7,500, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000010',
  'd0000000-0000-0000-0000-000000000007',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000004'),
  7500,
  1875,   -- 7500 * 0.25
  5625,   -- 7500 - 1875
  'JPY',
  'pending',
  '2026-03-07 12:00:00+09'
);

-- Payment 11: Booking 11 — 木村さくら × 山本あかり (¥7,000, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000011',
  'b0000000-0000-0000-0000-000000000011',
  'd0000000-0000-0000-0000-000000000003',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000003'),
  7000,
  1750,   -- 7000 * 0.25
  5250,   -- 7000 - 1750
  'JPY',
  'pending',
  '2026-03-07 15:00:00+09'
);

-- Payment 17: Booking 17 — 高橋優花 × 中村彩花 (¥5,000, 25% fee)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000017',
  'b0000000-0000-0000-0000-000000000017',
  'd0000000-0000-0000-0000-000000000001',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000005'),
  5000,
  1250,   -- 5000 * 0.25
  3750,   -- 5000 - 1250
  'JPY',
  'pending',
  '2026-03-07 21:00:00+09'
);

-- ---------------------------------------------------------------------------
-- REFUNDED payments — cancelled bookings
-- ---------------------------------------------------------------------------

-- Payment 12: Booking 12 — 渡辺翔太 × 中村彩花 (¥5,000, 25% fee) — 体調不良のためキャンセル
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000012',
  'b0000000-0000-0000-0000-000000000012',
  'd0000000-0000-0000-0000-000000000002',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000005'),
  5000,
  1250,   -- 5000 * 0.25
  3750,   -- 5000 - 1250
  'JPY',
  'refunded',
  'pi_test_booking012_refunded',
  '2026-02-10 13:00:00+09'
);

-- Payment 13: Booking 13 — 加藤大輝 × 伊藤大和 (¥5,000, 25% fee) — 日程変更のためキャンセル
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status, stripe_payment_intent_id, created_at)
VALUES (
  'p0000000-0000-0000-0000-000000000013',
  'b0000000-0000-0000-0000-000000000013',
  'd0000000-0000-0000-0000-000000000004',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000006'),
  5000,
  1250,   -- 5000 * 0.25
  3750,   -- 5000 - 1250
  'JPY',
  'refunded',
  'pi_test_booking013_refunded',
  '2026-02-20 10:00:00+09'
);

-- ============================================================
-- レビューデータ
-- ============================================================

-- =============================================================================
-- 05_reviews.sql - Seed review records for completed bookings
-- Platform: カウンセラーマッチ (Counselor Match)
-- Operator: 合同会社AICREO NEXT
-- Founder:  小林由起子 (harmony-mc.com)
--
-- Fixed UUIDs:
--   Reviews: r0000000-0000-0000-0000-000000000001 ~ r0000000-0000-0000-0000-000000000006
--
-- Only completed bookings can have reviews (UNIQUE constraint on booking_id).
--
-- Completed bookings (from 03_bookings.sql):
--   b...0001  高橋優花 × 鈴木健太  キャリアストレス相談    2026-01-10
--   b...0002  木村さくら × 山本あかり  夫婦関係の悩み      2026-01-18
--   b...0003  吉田美月 × 田中美咲  トラウマケア初回       2026-02-05
--   b...0004  渡辺翔太 × 鈴木健太  転職相談              2026-02-14
--   b...0014  松本悠人 × 佐藤龍一  うつ・スピリチュアルケア 2026-01-25
--   b...0015  井上花音 × 田中美咲  グリーフケア           2026-02-22
--
-- Rating distribution: 5★×2, 4★×3, 3★×1
-- Anonymous reviews: 2 out of 6
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Review 1: 高橋優花 → 鈴木健太（キャリアストレス相談）★5
-- ---------------------------------------------------------------------------
INSERT INTO reviews (id, booking_id, client_id, counselor_id, rating, comment, is_anonymous, created_at)
VALUES (
  'r0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000002'),
  5,
  '仕事のストレスで眠れない日が続いていましたが、鈴木先生に具体的なストレスマネジメントの方法を教えていただき、少しずつ改善してきました。話をじっくり聞いてくださった上で的確なアドバイスをいただけたので、安心して相談できました。また定期的にお世話になりたいと思います。',
  false,
  '2026-01-11 09:00:00+09'
);

-- ---------------------------------------------------------------------------
-- Review 2: 木村さくら → 山本あかり（夫婦関係の悩み）★4
-- ---------------------------------------------------------------------------
INSERT INTO reviews (id, booking_id, client_id, counselor_id, rating, comment, is_anonymous, created_at)
VALUES (
  'r0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000003'),
  4,
  '山本先生はとても穏やかで、こちらの話を否定せずに受け止めてくださいました。夫との関係について第三者の視点からアドバイスをもらえたことで、自分の中でも整理がつきました。もう少し具体的なワークがあると嬉しかったですが、全体的にとても良いセッションでした。',
  false,
  '2026-01-19 20:30:00+09'
);

-- ---------------------------------------------------------------------------
-- Review 3: 吉田美月 → 田中美咲（トラウマケア初回）★5 [匿名]
-- ---------------------------------------------------------------------------
INSERT INTO reviews (id, booking_id, client_id, counselor_id, rating, comment, is_anonymous, created_at)
VALUES (
  'r0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000005',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  5,
  '過去のつらい体験について話すのはとても勇気が要りましたが、田中先生の温かく落ち着いた雰囲気のおかげで、安心して自分の気持ちを言葉にすることができました。EMDRのアプローチも丁寧に説明してくださり、初回から少し心が軽くなったのを感じています。継続してお世話になりたいです。',
  true,
  '2026-02-06 10:15:00+09'
);

-- ---------------------------------------------------------------------------
-- Review 4: 渡辺翔太 → 鈴木健太（転職相談）★4
-- ---------------------------------------------------------------------------
INSERT INTO reviews (id, booking_id, client_id, counselor_id, rating, comment, is_anonymous, created_at)
VALUES (
  'r0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000002',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000002'),
  4,
  '転職を考えていたものの何から始めればいいか分からず悩んでいましたが、鈴木先生に自分の強みや価値観を一緒に整理していただけました。電話でのセッションでしたが、先生の声のトーンが落ち着いていて、とても話しやすかったです。次のステップが見えてきたので、行動に移していきたいと思います。',
  false,
  '2026-02-15 12:00:00+09'
);

-- ---------------------------------------------------------------------------
-- Review 5: 松本悠人 → 佐藤龍一（うつ・スピリチュアルケア）★3 [匿名]
-- ---------------------------------------------------------------------------
INSERT INTO reviews (id, booking_id, client_id, counselor_id, rating, comment, is_anonymous, created_at)
VALUES (
  'r0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000014',
  'd0000000-0000-0000-0000-000000000006',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000004'),
  3,
  '佐藤先生のスピリチュアルなアプローチは独特で興味深かったのですが、正直なところ自分にはまだ馴染みが薄く、すぐに効果を実感するのは難しかったです。ただ、瞑想の基本を教えてもらえたのは良かったです。もう少し回数を重ねれば変わるのかもしれないので、検討してみたいと思います。',
  true,
  '2026-01-26 21:00:00+09'
);

-- ---------------------------------------------------------------------------
-- Review 6: 井上花音 → 田中美咲（グリーフケア）★4
-- ---------------------------------------------------------------------------
INSERT INTO reviews (id, booking_id, client_id, counselor_id, rating, comment, is_anonymous, created_at)
VALUES (
  'r0000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000015',
  'd0000000-0000-0000-0000-000000000007',
  (SELECT id FROM counselors WHERE user_id = 'c0000000-0000-0000-0000-000000000001'),
  4,
  '大切な家族を亡くした悲しみをどう受け止めればいいのか分からずにいましたが、田中先生は無理に前を向かせようとせず、今の気持ちをそのまま大切にしていいと言ってくださいました。涙が止まらなくなっても静かに寄り添ってくださり、本当に救われました。悲しみとの向き合い方を少しずつ学んでいきたいです。',
  false,
  '2026-02-23 11:30:00+09'
);

COMMIT;
