-- =============================================================================
-- Avatars Storage バケット + RLS ポリシー
--
-- 目的: ユーザーが自分の avatar 画像をアップロード/差し替えできるようにする
-- バケット: avatars (public read, authenticated write)
-- =============================================================================

-- バケット作成（public = anon でも GET 可）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 既存 policy を一旦 drop（再実行可能に）
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_user_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_user_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_user_delete" ON storage.objects;

-- 公開 read
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ユーザーは自分の uid プレフィクスのファイルのみ INSERT/UPDATE/DELETE 可
-- ファイルパス規約: {user_id}/{filename}.{ext}
CREATE POLICY "avatars_user_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
