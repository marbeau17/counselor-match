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
