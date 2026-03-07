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
