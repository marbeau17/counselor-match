# ランディングページ動的化 + 画像生成統合 仕様書 (rev.2)

**作成日**: 2026-04-25
**改訂**: rev.2 — ユーザーフィードバック反映 (項目 ①③④⑤⑥⑦⑧)
**対象**: counselor-match (https://counselors.aicreonext.com)
**目的**:
1. トップページ (LP) を **管理画面から動的に編集可能** にする
2. **Gemini Banana Pro (`gemini-3-pro-image-preview`)** で AI バナー / ヒーロー画像を生成
3. API キーは管理画面から設定し DB に **暗号化** して保存
4. **ライブプレビュー / 下書き→公開ワークフロー / A/B テスト / プロンプトテンプレート** を備える

---

## 1. rev.2 で追加・拡張する仕様

| # | テーマ | 変更内容 |
|---|--------|----------|
| ① | **セクションライブラリ拡張** | 既存 12 種 → **22 種** に拡張 (10 種新規追加) |
| ③ | **プロンプトテンプレート** | `prompt_templates` テーブル + 管理 UI でテンプレ保存/呼出 |
| ④ | **画像サイズ / アスペクト拡張** | 6 アスペクト × 2 サイズ (Standard / HD) |
| ⑤ | **画像 ↔ セクション紐付け** | `landing_section_image_uses` ジャンクション。生成画像から「使われている場所」を逆引き可 |
| ⑥ | **ライブプレビュー** | 編集ペイン横の iframe で `/?_preview=token` をリアルタイム再描画 |
| ⑦ | **下書き → 公開ワークフロー** | `landing_sections` に `draft_props` / `published_props` 二重列。「公開」で draft → published コピー |
| ⑧ | **A/B テスト基盤** | `variant_key` カラム + `variant_weight` でランダム抽選表示 |

---

## 2. 採用するセクションライブラリ (rev.2: 22 種)

### 既存 12 種 (rev.1 から引継)
hero / trust_bar / features / how_it_works / counselor_showcase / testimonials / media_logos / pricing / faq / cta_banner / tools_promo / column_promo

### 新規 10 種
| section_type | 用途 | 主要 props |
|-------------|------|-----------|
| `hero_video` | ヒーロー動画背景 | `headline`, `subheadline`, `cta_label`, `cta_url`, `video_url`, `poster_url` |
| `comparison_table` | 競合との比較表 | `columns: string[]`, `rows: [{label, values: bool[]}]` |
| `stats_counter` | 数値実績 | `items: [{value, label, suffix}]` |
| `before_after` | ビフォー / アフター | `items: [{before, after, image_url?}]` |
| `story` | 創業ストーリー | `headline`, `body`, `image_url`, `author_name`, `author_role` |
| `lead_capture` | メルマガ登録 / 資料請求 | `headline`, `subheadline`, `submit_label`, `success_message`, `list_id` |
| `rich_text` | ブログ風自由記述 | `markdown`, `max_width` |
| `marquee` | 流れる帯 (実績数値等) | `items: string[]`, `speed` |
| `video_embed` | YouTube 等動画埋込 | `headline`, `embed_url`, `caption` |
| `certifications` | 認定 / 資格バッジ | `items: [{label, image_url, link}]` |

合計 **22 種** から管理画面で自由に選択 / 並べ替え / 重複配置可。

---

## 3. データベース設計 (rev.2)

### 3.1 `landing_sections` (動的セクション + draft/published 二重列)
```sql
CREATE TABLE public.landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL DEFAULT 'home',
  section_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,

  -- ⑦ 下書き / 公開 二重列
  draft_props JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_props JSONB,                                    -- 公開済 (NULL なら未公開セクション)
  published_at TIMESTAMPTZ,                                 -- 最後に公開した時刻
  has_unpublished_changes BOOLEAN GENERATED ALWAYS AS (     -- UI 表示用フラグ
    published_props IS NULL OR draft_props::text <> published_props::text
  ) STORED,

  -- ⑧ A/B テスト
  variant_key TEXT,                                         -- 同 variant_key の中で variant_weight 比率で抽選
  variant_weight INTEGER NOT NULL DEFAULT 1,                -- variant_key 内での重み

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_landing_sections_page_order ON public.landing_sections (page_key, sort_order);
CREATE INDEX idx_landing_sections_variant ON public.landing_sections (variant_key) WHERE variant_key IS NOT NULL;
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;
-- 公開ページは published_props IS NOT NULL のみ参照
CREATE POLICY "landing_sections_select_published" ON public.landing_sections FOR SELECT
  USING (is_visible = true AND published_props IS NOT NULL);
-- 編集は service_role 経由
```

### 3.2 `landing_publish_history` (公開履歴 / ロールバック用)
```sql
CREATE TABLE public.landing_publish_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL DEFAULT 'home',
  snapshot JSONB NOT NULL,            -- 公開時点の全セクション (id, sort_order, props, ...)
  published_by UUID REFERENCES public.profiles(id),
  note TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_landing_publish_history_page ON public.landing_publish_history (page_key, published_at DESC);
```

### 3.3 `generated_images` (画像生成: ⑤ usage 紐付け対応)
```sql
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  prompt_template_id UUID REFERENCES public.prompt_templates(id),  -- ③ テンプレート参照
  model TEXT NOT NULL DEFAULT 'gemini-3-pro-image-preview',
  aspect_ratio TEXT NOT NULL DEFAULT '1:1',  -- ④
  size_preset TEXT NOT NULL DEFAULT 'standard',  -- 'standard' | 'hd'
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','succeeded','failed')),
  error_message TEXT,
  tags TEXT[] DEFAULT '{}',                -- 検索用 (e.g. {hero, sunrise})
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_generated_images_created ON public.generated_images (created_at DESC);
CREATE INDEX idx_generated_images_tags ON public.generated_images USING gin(tags);
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
-- service_role only
```

### 3.4 `prompt_templates` (③ プロンプトテンプレ)
```sql
CREATE TABLE public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                       -- '柔らかい朝光ヒーロー' 等
  category TEXT,                            -- 'hero' | 'banner' | 'avatar' | 'illustration' | ...
  prompt_template TEXT NOT NULL,            -- '{topic} のシーン, {style} スタイル' のような placeholder 可
  default_aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  default_size_preset TEXT NOT NULL DEFAULT 'standard',
  variables JSONB DEFAULT '[]'::jsonb,      -- [{name:'topic', label:'テーマ', default:'sunrise'}]
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prompt_templates_category ON public.prompt_templates (category);
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
-- service_role only
```

### 3.5 `landing_section_image_uses` (⑤ 画像 ↔ セクション紐付け)
```sql
CREATE TABLE public.landing_section_image_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.landing_sections(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES public.generated_images(id) ON DELETE CASCADE,
  field_path TEXT NOT NULL,                  -- 'bg_image_url' | 'items[2].image_url' 等
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, image_id, field_path)
);
CREATE INDEX idx_image_uses_section ON public.landing_section_image_uses (section_id);
CREATE INDEX idx_image_uses_image ON public.landing_section_image_uses (image_id);
ALTER TABLE public.landing_section_image_uses ENABLE ROW LEVEL SECURITY;
-- service_role only
```

→ 画像ライブラリで「この画像を使っている場所」を逆引き表示可能。
→ セクション保存時に props を走査して自動で uses を upsert。

### 3.6 `app_settings` (rev.1 と同じ — 暗号化キー保管)
```sql
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value_encrypted TEXT,
  value_plain TEXT,
  is_secret BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
-- service_role only
```

### 3.7 Storage バケット
- `public-images` (public read) — Gemini 生成画像 + 手動アップロード

---

## 4. 暗号化 (rev.1 と同じ)

`SETTINGS_ENCRYPTION_KEY` 環境変数 (32 bytes hex) + AES-256-GCM。
Vercel に追加が必要。生成: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 5. Gemini Banana Pro 統合

### 5.1 モデル
- `gemini-3-pro-image-preview` (固定)
- 将来モデル切替用に `app_settings` に `gemini.image_model` を保持 (上書き可)

### 5.2 ④ 画像サイズ / アスペクト

**アスペクト比 (6 種)**
- `1:1` (正方形 — アバター / SNS)
- `16:9` (ヒーロー / バナー / OGP)
- `9:16` (縦長 — モバイル全画面 / Stories)
- `4:3` (やや横 — カード)
- `3:4` (やや縦 — ポートレート)
- `21:9` (ウルトラワイド — 帯)

**サイズプリセット (2 種)**
- `standard` (短辺 1024px)
- `hd` (短辺 2048px)

prompt 内に `--ar {ratio}` ヒントを組み込み + post-process で目的アスペクトに crop。

### 5.3 生成フロー
```
[admin UI] prompt + aspect + size + (template_id?)
  ↓ POST /api/admin/images/generate
[server]
  1. requireAdminForApi
  2. getSecretSetting('gemini.api_key')
  3. Gemini API call (REST)
  4. Buffer → Supabase Storage upload
  5. INSERT generated_images
  6. logAdminAction('image.generate')
  7. return { id, public_url, ... }
```

---

## 6. 管理画面 UI (rev.2 拡張)

### 6.1 `/dashboard/admin/landing` — LP エディタ
**3 カラムレイアウト**
- **左ペイン (固定 280px)**: セクションリスト
  - ドラッグ並び替え
  - トグル: 表示 / 非表示
  - バッジ: `🟡 未公開差分あり` / `🅰 variant: hero_test_1` (A/B 中)
  - `+ セクション追加` モーダル (22 種から選択)
- **中央ペイン (可変)**: 選択中セクションの props 編集フォーム
  - section_type 別に schema-driven フォーム自動生成
  - 画像入力フィールドは「ライブラリから選択」「新規生成」両ボタン
  - **A/B テスト設定**: variant_key + weight 入力欄
- **右ペイン (固定 480px)**: ⑥ **ライブプレビュー**
  - `<iframe src="/?_preview={token}&section={id}" />`
  - draft_props を反映した状態でレンダリング
  - 編集後 ~500ms debounce で iframe を `postMessage` で再描画
  - デスクトップ / タブレット / モバイル のサイズ切替

**上部ツールバー**
- `[ 全体プレビュー ]` (新タブで `/?_preview={token}`)
- `[ 公開 ]` (確認モーダル → publish API → snapshot 保存 → revalidatePath('/'))
- `[ 公開履歴 ]` (履歴一覧 → 「この時点に戻す」)

### 6.2 `/dashboard/admin/images` — 画像ライブラリ (rev.2)
- 上部フィルタ: タグ / アスペクト / 期間 / 「使われている画像のみ」
- グリッド表示 (サムネイル + メタ)
- 画像クリック: モーダルで詳細
  - フル画像 + URL
  - 元プロンプト + テンプレート名
  - **⑤ 「使用中の場所」**: `landing_section_image_uses` を逆引きしてリスト表示 → クリックで該当セクションエディタへ
  - `[ 削除 ]` (uses があれば警告)
- `[ + 新規生成 ]` モーダル:
  - **③ テンプレート選択ドロップダウン** (or "テンプレートなし")
  - テンプレートを選ぶと variables フォームが動的生成
  - aspect / size 選択
  - prompt 編集 (テンプレート展開後の最終 prompt を編集可)
  - tags 入力 (chips)
  - `[ 生成 ]` → スピナー → 完了でグリッドに追加
- `[ + テンプレート管理 ]` → 別ページ (6.3)

### 6.3 `/dashboard/admin/images/templates` — ③ プロンプトテンプレ管理
- 一覧 (name / category / お気に入り)
- `+ 新規` / 編集モーダル
  - name / category / prompt_template (placeholder UI: `{topic}` 等)
  - variables 配列 (name / label / default)
  - default aspect / size

### 6.4 `/dashboard/admin/settings` — 設定
- セクション「外部 API」
  - Gemini API Key (password input)
    - 保存済なら `••••••••` + `[ 再設定 ]`
  - `[ テスト ]` ボタン: 簡易リクエスト疎通
  - `gemini.image_model` (text input, default `gemini-3-pro-image-preview`)
- セクション「LP 公開」
  - 公開時に Slack 通知 / メール通知 (将来用 placeholder)

### 6.5 admin layout ナビ追加
新規セクション「**LP / コンテンツ**」:
- ランディング編集
- 画像ライブラリ
- プロンプトテンプレ
- 設定

---

## 7. 公開 LP 動的レンダリング

### 7.1 `/` (HomePage)
```ts
// src/app/page.tsx
export const revalidate = 60

export default async function HomePage({ searchParams }: { searchParams: Promise<{ _preview?: string; section?: string }> }) {
  const sp = await searchParams
  const isPreview = await verifyPreviewToken(sp._preview)
  const sections = isPreview
    ? await fetchDraftSections('home', sp.section)
    : await fetchPublishedSections('home')
  // A/B テスト: variant_key 単位で重みランダム選択
  const resolved = resolveVariants(sections)
  return (
    <main>
      {resolved.map((s) => <SectionRenderer key={s.id} section={s} />)}
    </main>
  )
}
```

### 7.2 `SectionRenderer`
- 22 セクション全部を `REGISTRY` map に登録
- 未知 section_type は `null` 返し
- ⑦ プレビュー時は draft_props、本番時は published_props を渡す

### 7.3 ⑧ A/B テスト
- 同じ `variant_key` を持つセクション群を 1 つにまとめ、`variant_weight` 比でランダム選択
- セッション内では一貫性のため cookie に variant_id を保存 (将来計測用)

### 7.4 ⑥ プレビュートークン
- 公開 LP は SSR/ISR
- `?_preview=` パラメータが正しい署名トークンなら **draft 表示モード**
- トークン生成: `requireAdmin` 通過後 HMAC(SHA256, page_key + ts, SETTINGS_ENCRYPTION_KEY) (1 時間有効)

### 7.5 ⑦ 公開フロー
```
[admin UI] [公開] クリック
  ↓ POST /api/admin/landing/publish
[server]
  1. requireAdminForApi
  2. snapshot を作成 (全 sections の現状)
  3. INSERT into landing_publish_history
  4. UPDATE landing_sections SET published_props = draft_props, published_at = NOW()
       WHERE page_key = 'home'
  5. revalidatePath('/')
  6. logAdminAction('landing.publish')
```

### 7.6 ロールバック
- 公開履歴一覧 → 「この時点に戻す」 → 履歴の snapshot から各 section の draft_props を上書き → 再度公開ボタンで反映

---

## 8. デフォルトコンテンツ (seed)

migration 内で `landing_sections` に既存 LP コンテンツを seed:
1. hero (見出し: 「魂と関係を整える、伴走型カウンセリング」)
2. trust_bar (4 バッジ)
3. features (3 つ)
4. how_it_works (4 ステップ)
5. tools_promo (3 ツール)
6. counselor_showcase (level=master, count=3)
7. testimonials (3 件、仮データ)
8. column_promo (count=3)
9. cta_banner

seed 時は draft_props と published_props を同一値で投入し、初回から公開状態に。

---

## 9. 受け入れ基準 (rev.2: 33 項目)

### LP 動的レンダリング
- **AC-LP-R01**: `/` アクセス時 DB の `landing_sections` から `published_props` を読み、is_visible=true & sort_order 順で表示
- **AC-LP-R02**: 未知 section_type はエラーを出さず無視
- **AC-LP-R03**: `revalidate = 60` で ISR / 公開ボタンで強制再生成
- **AC-LP-R04**: ⑦ `?_preview={token}` で draft_props 表示
- **AC-LP-R05**: ⑧ variant_key を持つセクションは weight 比でランダム抽選

### 管理 UI
- **AC-LP-E01**: `/dashboard/admin/landing` で全セクションが現順序で表示
- **AC-LP-E02**: ドラッグで順序変更 → 保存 → DB sort_order 反映
- **AC-LP-E03**: 各セクションのトグルで is_visible 反転
- **AC-LP-E04**: `+ セクション追加` で 22 種から選択 → 末尾追加
- **AC-LP-E05**: 各 props フィールドが type 別に schema-driven フォームでレンダリング
- **AC-LP-E06**: ⑥ 右ペイン iframe にライブプレビューが表示され、編集 ~500ms 後に再描画
- **AC-LP-E07**: ⑦ 「未公開差分あり」バッジが draft != published のセクションに表示
- **AC-LP-E08**: ⑦ 「公開」で snapshot 保存 + draft → published コピー + revalidate
- **AC-LP-E09**: ⑦ 「公開履歴」一覧 + ロールバック動作
- **AC-LP-E10**: ⑧ variant_key + weight 入力 UI が機能

### 画像生成
- **AC-LP-I01**: `/dashboard/admin/images` で過去生成画像が grid 表示
- **AC-LP-I02**: `+ 新規生成` で prompt + aspect + size 入力 → 画像表示
- **AC-LP-I03**: 生成画像は Supabase Storage に保存され public URL が返る
- **AC-LP-I04**: 失敗時はエラーメッセージが UI に表示
- **AC-LP-I05**: ライブラリから画像を選択して LP セクション image_url に挿入
- **AC-LP-I06**: ⑤ 画像詳細モーダルに「使用中の場所」が逆引き表示
- **AC-LP-I07**: ④ 6 アスペクト × 2 サイズ から選択可能
- **AC-LP-I08**: タグ検索 / アスペクトフィルタが効く

### プロンプトテンプレート (③)
- **AC-LP-T01**: `/dashboard/admin/images/templates` で一覧 / 新規 / 編集 / 削除可能
- **AC-LP-T02**: 画像生成モーダルでテンプレートを選ぶと variables フォームが動的生成
- **AC-LP-T03**: variables を入力すると prompt にプレースホルダ展開
- **AC-LP-T04**: 「お気に入り」フラグで上位表示

### 設定 / 暗号化
- **AC-LP-S01**: `/dashboard/admin/settings` で Gemini API キーを保存
- **AC-LP-S02**: 保存後は DB に AES-256-GCM 暗号化文字列で格納
- **AC-LP-S03**: 復号は service_role API のみ
- **AC-LP-S04**: API キー未設定で生成すると 503 + 案内
- **AC-LP-S05**: 「テスト」ボタンで Gemini に疎通確認

### 監査ログ
- **AC-LP-A01**: セクションの追加/更新/順序変更/削除/公開を `admin_audit_log` 記録
- **AC-LP-A02**: API キー保存/更新を記録 (値は記録しない)
- **AC-LP-A03**: 画像生成を記録
- **AC-LP-A04**: ⑦ ロールバック実行を記録

---

## 10. セキュリティ要件 (rev.1 と同じ)

- API キーは AES-256-GCM 暗号化必須
- `SETTINGS_ENCRYPTION_KEY` 環境変数 (32 bytes hex)
- 復号は service_role API ルート内のみ
- フロントには平文 / 暗号化文字列とも返さない
- ⑥ プレビュートークンは HMAC 署名付き 1 時間有効

---

## 11. 環境変数追加

| 変数名 | 用途 | 例 |
|-------|------|-----|
| `SETTINGS_ENCRYPTION_KEY` | API キー暗号化 + プレビュートークン署名 | 64 文字 hex (32 bytes) |

---

## 12. 実装順序 (Phase B3 — rev.2)

1. **DB マイグレーション** `20260425000010_landing_pages.sql`
   - 6 テーブル (landing_sections / landing_publish_history / generated_images / prompt_templates / landing_section_image_uses / app_settings)
   - storage bucket `public-images`
   - 既存 LP コンテンツ seed (draft_props + published_props 同値で投入)
   - プロンプトテンプレ初期 6 件 (Hero / Step×4 / CTA バナー)
2. **lib**
   - `secrets.ts` (AES-256-GCM)
   - `preview-token.ts` (HMAC 署名)
   - `landing.ts` (sections fetch / variant 抽選)
   - `gemini.ts` (Banana Pro REST client)
3. **公開 LP 書き換え**
   - `src/app/page.tsx` (preview / variant 対応)
   - `src/components/landing/sections/*.tsx` (22 種)
   - `src/components/landing/section-renderer.tsx` (REGISTRY)
4. **API ルート**
   - `/api/admin/settings` (GET masked / PUT encrypt)
   - `/api/admin/settings/test-gemini` (POST 疎通)
   - `/api/admin/images` (GET 一覧 / DELETE)
   - `/api/admin/images/generate` (POST)
   - `/api/admin/prompt-templates` (CRUD)
   - `/api/admin/landing/sections` (CRUD + bulk reorder)
   - `/api/admin/landing/publish` (POST → snapshot + revalidate)
   - `/api/admin/landing/publish-history` (GET / POST rollback)
   - `/api/admin/landing/preview-token` (POST → HMAC 発行)
5. **管理画面**
   - `/dashboard/admin/settings`
   - `/dashboard/admin/images` + `/templates`
   - `/dashboard/admin/landing` (3 カラムエディタ + iframe プレビュー)
6. **admin layout** にナビ追加
7. **検証** (tsc / lint / vitest / next build)
8. **commit & push**

---

## 13. ユーザーが事前に行うこと

1. Vercel に `SETTINGS_ENCRYPTION_KEY` 追加
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Google AI Studio で Gemini API キーを取得 (https://aistudio.google.com/app/apikey)
3. (実装後) Supabase Dashboard で migration `20260425000010_landing_pages.sql` 実行
4. (実装後) `/dashboard/admin/settings` で Gemini API キー登録
5. (実装後) `/dashboard/admin/images` で初期画像生成
6. (実装後) `/dashboard/admin/landing` でセクション編集 + 公開

---

## 14. スコープ外 (将来)

- ローカライズ (en / 中国語) → 別フェーズ
- 公開 LP に GA / コンバージョン計測埋込 → 別フェーズ
- /for-counselors の動的化 → 別フェーズ
- A/B テスト結果の自動勝者判定 → 別フェーズ (今は手動切替)
- イメージ to イメージ編集 / inpainting → 別フェーズ
