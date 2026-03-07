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
