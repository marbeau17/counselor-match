-- =============================================================================
-- E2E テスト用ユーザー seed
-- AC-B06-Auth (認証付き予約完了) と login-auth e2e で使用。
--
-- 注意:
-- - auth.users への直接 INSERT は SECURITY DEFINER 必須 (service_role 経由のみ)
-- - SQL Editor は service_role 相当で動くため SQL Editor からのみ実行可
-- - パスワードは bcrypt ハッシュ化が必要 → crypt() 使用 (pgcrypto)
-- - 本番環境では絶対に使わないこと（テスト専用ダミー値）
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- テストユーザー定義（3 名）
-- -----------------------------------------------------------------------------
-- 1. e2e_client_001@example.com / TestPass!2026 (role: client) - 予約フロー検証
-- 2. e2e_counselor_001@example.com / TestPass!2026 (role: counselor) - カウンセラーUI検証
-- 3. e2e_admin_001@example.com / TestPass!2026 (role: admin) - admin dashboard 検証
-- -----------------------------------------------------------------------------

-- 既存削除（再実行可能にする）
DELETE FROM auth.users WHERE email IN (
  'e2e_client_001@example.com',
  'e2e_counselor_001@example.com',
  'e2e_admin_001@example.com'
);

-- -----------------------------------------------------------------------------
-- auth.users への INSERT (Supabase auth ハッシュ形式: bcrypt)
-- -----------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, confirmation_token,
  recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, last_sign_in_at,
  is_super_admin, is_sso_user
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'e2e00000-0000-0000-0000-000000000001'::uuid,
    'authenticated', 'authenticated', 'e2e_client_001@example.com',
    crypt('TestPass!2026', gen_salt('bf')), NOW(), '', '', '', '',
    jsonb_build_object('provider','email','providers',ARRAY['email']),
    jsonb_build_object('full_name','E2E Client 1'),
    NOW(), NOW(), NOW(), false, false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'e2e00000-0000-0000-0000-000000000002'::uuid,
    'authenticated', 'authenticated', 'e2e_counselor_001@example.com',
    crypt('TestPass!2026', gen_salt('bf')), NOW(), '', '', '', '',
    jsonb_build_object('provider','email','providers',ARRAY['email']),
    jsonb_build_object('full_name','E2E Counselor 1'),
    NOW(), NOW(), NOW(), false, false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'e2e00000-0000-0000-0000-000000000003'::uuid,
    'authenticated', 'authenticated', 'e2e_admin_001@example.com',
    crypt('TestPass!2026', gen_salt('bf')), NOW(), '', '', '', '',
    jsonb_build_object('provider','email','providers',ARRAY['email']),
    jsonb_build_object('full_name','E2E Admin 1'),
    NOW(), NOW(), NOW(), false, false
  );

-- -----------------------------------------------------------------------------
-- profiles への INSERT (id は auth.users と同じ)
-- -----------------------------------------------------------------------------
INSERT INTO profiles (id, email, full_name, display_name, role)
VALUES
  ('e2e00000-0000-0000-0000-000000000001'::uuid, 'e2e_client_001@example.com', 'E2E Client 1', 'クライアント1', 'client'),
  ('e2e00000-0000-0000-0000-000000000002'::uuid, 'e2e_counselor_001@example.com', 'E2E Counselor 1', 'カウンセラー1', 'counselor'),
  ('e2e00000-0000-0000-0000-000000000003'::uuid, 'e2e_admin_001@example.com', 'E2E Admin 1', '管理者1', 'admin')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- E2E counselor のための counselors レコード
-- -----------------------------------------------------------------------------
INSERT INTO counselors (id, user_id, level, title, bio, hourly_rate, is_active, available_session_types)
VALUES (
  'e2ec0000-0000-0000-0000-000000000001'::uuid,
  'e2e00000-0000-0000-0000-000000000002'::uuid,
  'regular',
  'E2E テスト用カウンセラー',
  'E2E 自動テストでのみ使用するカウンセラーです。',
  6000,
  true,
  ARRAY['online','chat','phone']::session_type[]
)
ON CONFLICT (id) DO UPDATE SET
  hourly_rate = EXCLUDED.hourly_rate,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 確認用クエリ
-- -----------------------------------------------------------------------------
-- SELECT email, role FROM profiles WHERE email LIKE 'e2e_%';
