-- =============================================================================
-- Mock counselor IDs を Supabase に同期
-- src/lib/mock-data.ts で固定された 6 名の counselor を Supabase に upsert する。
-- これで /counselors → /counselors/[id] → /booking/[id] → 予約成立 まで mock ID で完走可能になる。
--
-- 注意:
-- - profiles の id は通常 auth.users.id を参照する（FK ON DELETE CASCADE）
-- - 本 seed は auth.users へも直接 INSERT して FK を満たす（demo 用、ログイン不可）
-- - パスワードは null（OAuth/匿名扱い）。実ログイン用には別途 06_test_users.sql を使用
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- auth.users (FK 充足のため、ログイン不可ダミー)
-- -----------------------------------------------------------------------------
INSERT INTO auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin, is_sso_user)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000001'::uuid, 'authenticated', 'authenticated', 'misaki.tanaka@example.com',  '{}'::jsonb, jsonb_build_object('full_name','田中美咲'),   NOW(), NOW(), false, false),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000002'::uuid, 'authenticated', 'authenticated', 'kenta.suzuki@example.com',   '{}'::jsonb, jsonb_build_object('full_name','鈴木健太'),   NOW(), NOW(), false, false),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000003'::uuid, 'authenticated', 'authenticated', 'akari.yamamoto@example.com', '{}'::jsonb, jsonb_build_object('full_name','山本あかり'), NOW(), NOW(), false, false),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000004'::uuid, 'authenticated', 'authenticated', 'ryuichi.sato@example.com',   '{}'::jsonb, jsonb_build_object('full_name','佐藤龍一'),   NOW(), NOW(), false, false),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000005'::uuid, 'authenticated', 'authenticated', 'ayaka.nakamura@example.com', '{}'::jsonb, jsonb_build_object('full_name','中村彩花'),   NOW(), NOW(), false, false),
  ('00000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000006'::uuid, 'authenticated', 'authenticated', 'yamato.ito@example.com',     '{}'::jsonb, jsonb_build_object('full_name','伊藤大和'),   NOW(), NOW(), false, false)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
INSERT INTO profiles (id, email, full_name, display_name, avatar_url, role, phone)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'misaki.tanaka@example.com',  '田中美咲',   '田中美咲',   NULL, 'counselor', '090-1111-0001'),
  ('c0000000-0000-0000-0000-000000000002', 'kenta.suzuki@example.com',   '鈴木健太',   '鈴木健太',   NULL, 'counselor', '090-1111-0002'),
  ('c0000000-0000-0000-0000-000000000003', 'akari.yamamoto@example.com', '山本あかり', '山本あかり', NULL, 'counselor', '090-1111-0003'),
  ('c0000000-0000-0000-0000-000000000004', 'ryuichi.sato@example.com',   '佐藤龍一',   '佐藤龍一',   NULL, 'counselor', '090-1111-0004'),
  ('c0000000-0000-0000-0000-000000000005', 'ayaka.nakamura@example.com', '中村彩花',   '中村彩花',   NULL, 'counselor', '090-1111-0005'),
  ('c0000000-0000-0000-0000-000000000006', 'yamato.ito@example.com',     '伊藤大和',   '伊藤大和',   NULL, 'counselor', '090-1111-0006')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- counselors (6 名)
-- -----------------------------------------------------------------------------
INSERT INTO counselors (
  id, user_id, level, title, bio, specialties, certifications, hourly_rate,
  is_active, rating_average, rating_count, session_count, methodology,
  available_session_types, commission_rate, concerns, availability_mode,
  on_demand_enabled, price_per_minute, screening_status
)
VALUES
  -- 1. 田中美咲 (master, machiuke)
  ('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'master',
    'ホリスティック心理カウンセラー・マスター認定',
    '15年以上のカウンセリング経験を持ち、ホリスティック心理学の4層モデル（身体・心・精神・魂）に基づいた統合的アプローチを実践しています。特にトラウマケアとグリーフケアを専門とし、クライアントの内面からの癒しと変容をサポートします。',
    ARRAY['ホリスティック心理学','スピリチュアルケア','トラウマ','グリーフケア'],
    ARRAY['臨床心理士','ホリスティック心理学マスター認定','EMDR認定セラピスト','グリーフケアアドバイザー'],
    12000, true, 4.9, 127, 1850,
    ARRAY['holistic_psychology','soul_mirror_law','past_life','aura_reading'],
    ARRAY['online','chat','phone']::session_type[], 0.20,
    ARRAY['grief','life_purpose','self_understanding'], 'machiuke', true, 400, 'approved'),
  -- 2. 鈴木健太 (senior, accepting_bookings)
  ('c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'senior',
    'キャリア・ストレスマネジメント専門カウンセラー',
    '企業での人事・組織開発の経験を活かし、キャリアの悩みや職場のストレスに特化したカウンセリングを行っています。',
    ARRAY['キャリアカウンセリング','ストレスマネジメント','認知行動療法'],
    ARRAY['産業カウンセラー','国家資格キャリアコンサルタント','認知行動療法士'],
    9000, true, 4.7, 89, 920,
    ARRAY['numerology','personality_matrix_32','astrology'],
    ARRAY['online','chat']::session_type[], 0.20,
    ARRAY['work','life_purpose'], 'accepting_bookings', false, NULL, 'approved'),
  -- 3. 山本あかり (regular)
  ('c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'regular',
    'タロット・占術カウンセラー',
    'タロット・オラクルカードを通じて、人生の節目で必要な気づきを引き出すお手伝いをします。',
    ARRAY['タロット','オラクルカード','家族療法'],
    ARRAY['プロフェッショナルタロットリーダー','家族療法士'],
    7000, true, 4.6, 64, 430,
    ARRAY['oracle_cards','tarot','holistic_psychology'],
    ARRAY['online','chat']::session_type[], 0.20,
    ARRAY['love','family'], 'accepting_bookings', false, NULL, 'approved'),
  -- 4. 佐藤龍一 (regular, machiuke)
  ('c0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'regular',
    'スピリチュアルカウンセラー',
    'チャネリング・前世リーディング・オーラリーディングを統合した、深い自己理解のためのセッションを提供します。',
    ARRAY['チャネリング','前世リーディング','オーラリーディング'],
    ARRAY['スピリチュアルカウンセリング協会認定'],
    7500, true, 4.5, 52, 380,
    ARRAY['channeling','past_life','aura_reading','soul_mirror_law'],
    ARRAY['online','phone']::session_type[], 0.20,
    ARRAY['life_purpose','self_understanding','grief'], 'machiuke', true, 250, 'approved'),
  -- 5. 中村彩花 (starter)
  ('c0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'starter',
    'パーソナリティ診断カウンセラー',
    'Personality Matrix 32 とオラクルカードを組み合わせた、自己理解を深めるセッションが得意です。',
    ARRAY['Personality Matrix 32','オラクルカード','自己理解ワーク'],
    ARRAY['Personality Matrix 32 認定アナリスト'],
    5000, true, 4.4, 23, 85,
    ARRAY['personality_matrix_32','oracle_cards'],
    ARRAY['online','chat']::session_type[], 0.20,
    ARRAY['self_understanding','work'], 'accepting_bookings', false, NULL, 'approved'),
  -- 6. 伊藤大和 (starter)
  ('c0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', 'starter',
    '数秘術・タロットリーダー',
    '数秘術とタロットを組み合わせ、人生の流れと向き合うための洞察を提供します。',
    ARRAY['数秘術','タロット','Personality Matrix 32'],
    ARRAY['数秘術師認定','タロットリーダー認定'],
    5000, true, 4.3, 18, 62,
    ARRAY['numerology','personality_matrix_32','tarot'],
    ARRAY['online','chat']::session_type[], 0.20,
    ARRAY['self_understanding','life_purpose'], 'accepting_bookings', false, NULL, 'approved')
ON CONFLICT (id) DO UPDATE SET
  level = EXCLUDED.level,
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  specialties = EXCLUDED.specialties,
  certifications = EXCLUDED.certifications,
  hourly_rate = EXCLUDED.hourly_rate,
  is_active = EXCLUDED.is_active,
  rating_average = EXCLUDED.rating_average,
  rating_count = EXCLUDED.rating_count,
  session_count = EXCLUDED.session_count,
  methodology = EXCLUDED.methodology,
  available_session_types = EXCLUDED.available_session_types,
  commission_rate = EXCLUDED.commission_rate,
  concerns = EXCLUDED.concerns,
  availability_mode = EXCLUDED.availability_mode,
  on_demand_enabled = EXCLUDED.on_demand_enabled,
  price_per_minute = EXCLUDED.price_per_minute,
  screening_status = EXCLUDED.screening_status,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 確認
-- -----------------------------------------------------------------------------
-- SELECT id, level, hourly_rate, availability_mode FROM counselors WHERE id LIKE 'c0000000%';
