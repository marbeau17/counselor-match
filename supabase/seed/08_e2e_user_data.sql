-- =============================================================================
-- E2E テストユーザー (06_test_users.sql で作成済) のための rich data seed
-- 認証必須の dashboard / wallet / journey AC を網羅するため
-- UUID は hex のみ (0-9, a-f) を使用
-- =============================================================================

-- -----------------------------------------------------------------------------
-- e2e_client_001 の wallet + signup_bonus + topup
-- AC-DW01-04
-- -----------------------------------------------------------------------------

-- wallet (signup_bonus 3000 + topup 10000 - session_charge 7000 = 6000)
INSERT INTO wallets (id, user_id, balance_yen)
VALUES (
  'e2ea0000-0000-0000-0000-000000000001'::uuid,
  'e2e00000-0000-0000-0000-000000000001'::uuid,
  6000
)
ON CONFLICT (user_id) DO UPDATE SET balance_yen = EXCLUDED.balance_yen;

-- signup_bonus tx (¥3,000)
INSERT INTO wallet_transactions (id, wallet_id, type, amount_yen, expires_at, note, created_at)
VALUES (
  'e2ed0000-0000-0000-0000-000000000001'::uuid,
  'e2ea0000-0000-0000-0000-000000000001'::uuid,
  'signup_bonus',
  3000,
  NOW() + INTERVAL '14 days',
  '新規登録ボーナス',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- topup tx (¥10,000)
INSERT INTO wallet_transactions (id, wallet_id, type, amount_yen, note, created_at)
VALUES (
  'e2ed0000-0000-0000-0000-000000000002'::uuid,
  'e2ea0000-0000-0000-0000-000000000001'::uuid,
  'topup',
  10000,
  'チャージ (¥10,000)',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- e2e_client_001 の bookings (AC-DC04)
-- -----------------------------------------------------------------------------

-- 1. confirmed - 田中美咲
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes)
VALUES (
  'e2eb0000-0000-0000-0000-000000000001'::uuid,
  'e2e00000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'online',
  'confirmed',
  NOW() + INTERVAL '7 days',
  50,
  12000,
  'E2E test booking - confirmed'
)
ON CONFLICT (id) DO NOTHING;

-- 2. pending - 鈴木健太
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes)
VALUES (
  'e2eb0000-0000-0000-0000-000000000002'::uuid,
  'e2e00000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'chat',
  'pending',
  NOW() + INTERVAL '14 days',
  50,
  9000,
  'E2E test booking - pending'
)
ON CONFLICT (id) DO NOTHING;

-- 3. completed - 山本あかり
INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes)
VALUES (
  'e2eb0000-0000-0000-0000-000000000003'::uuid,
  'e2e00000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000003'::uuid,
  'phone',
  'completed',
  NOW() - INTERVAL '14 days',
  50,
  7000,
  'E2E test booking - completed'
)
ON CONFLICT (id) DO NOTHING;

-- session_charge tx for completed booking
INSERT INTO wallet_transactions (id, wallet_id, type, amount_yen, related_booking_id, note, created_at)
VALUES (
  'e2ed0000-0000-0000-0000-000000000003'::uuid,
  'e2ea0000-0000-0000-0000-000000000001'::uuid,
  'session_charge',
  -7000,
  'e2eb0000-0000-0000-0000-000000000003'::uuid,
  'セッション利用 (山本あかり)',
  NOW() - INTERVAL '13 days'
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- e2e_counselor_001 への bookings (AC-DCO01-02)
-- -----------------------------------------------------------------------------

INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes)
VALUES (
  'e2eb0000-0000-0000-0000-000000000010'::uuid,
  'd0000000-0000-0000-0000-000000000001'::uuid,
  'e2ec0000-0000-0000-0000-000000000001'::uuid,
  'online',
  'pending',
  NOW() + INTERVAL '5 days',
  50,
  6000,
  'E2E counselor pending'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes)
VALUES (
  'e2eb0000-0000-0000-0000-000000000011'::uuid,
  'd0000000-0000-0000-0000-000000000002'::uuid,
  'e2ec0000-0000-0000-0000-000000000001'::uuid,
  'online',
  'confirmed',
  NOW() + INTERVAL '10 days',
  50,
  6000,
  'E2E counselor confirmed'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (id, client_id, counselor_id, session_type, status, scheduled_at, duration_minutes, price, notes)
VALUES (
  'e2eb0000-0000-0000-0000-000000000012'::uuid,
  'd0000000-0000-0000-0000-000000000003'::uuid,
  'e2ec0000-0000-0000-0000-000000000001'::uuid,
  'online',
  'completed',
  NOW() - INTERVAL '7 days',
  50,
  6000,
  'E2E counselor completed'
)
ON CONFLICT (id) DO NOTHING;

-- payment for completed booking (counselor の総収益)
INSERT INTO payments (id, booking_id, client_id, counselor_id, amount, platform_fee, counselor_payout, currency, status)
VALUES (
  'e2ef0000-0000-0000-0000-000000000001'::uuid,
  'e2eb0000-0000-0000-0000-000000000012'::uuid,
  'd0000000-0000-0000-0000-000000000003'::uuid,
  'e2ec0000-0000-0000-0000-000000000001'::uuid,
  6000,
  900,
  5100,
  'JPY',
  'paid'
)
ON CONFLICT (id) DO NOTHING;
