# LP 管理画面強化 + SEO/LLMO 機能 仕様書

**作成日**: 2026-04-26
**対象**: `/dashboard/admin/landing` (LP セクション編集画面) + `landing_sections` テーブル + 全セクションレンダラ
**目的**: 非エンジニアでも (1) ワイヤーフレームの自由構成、(2) SEO 最適化、(3) LLMO (LLM Optimization) 対応の LP を作れる管理画面を実装する

---

## 1. 用語定義

- **SEO** (Search Engine Optimization): Google / Bing などの検索エンジン最適化 (heading 階層 / meta / 構造化データ / 内部リンク)
- **LLMO** (LLM Optimization): ChatGPT / Perplexity / Claude / Gemini などの LLM 検索 / 引用に対する最適化
  - Q&A 形式のコンテンツ、明確な答えブロック
  - Citation / authorship signals (E-E-A-T)
  - FAQ / HowTo schema による semantic richness
  - 一次情報の明示 (出典・更新日)

---

## 2. 現状

| 項目 | 現状 | ギャップ |
|---|---|---|
| `landing_sections` テーブル | 既存 (draft_props/published_props/sort_order/is_visible/variant) | SEO/LLMO 用の構造化フィールドなし |
| 管理画面 `/dashboard/admin/landing` | 既存 (453 行 editor.tsx) | drag&drop なし / セクション増減 UI 未整備 / SEO/LLMO ヒントなし |
| Section types | 22 種 (hero, features, story_narrative, gallery 等) | FAQ schema, HowTo schema, citations 等 LLMO 向けが不足 |
| セクションレンダラ | sections.tsx | structured data (JSON-LD) 出力なし |
| Live preview | `_preview` token で対応 | 編集中のリアルタイム反映が低速 |
| 公開 / draft | draft_props/published_props で対応済 | 部分公開 (セクション単位) なし |

---

## 3. 機能要件

### 3.1 ワイヤーフレーム自由構成

| ID | 要件 | 検証 |
|---|---|---|
| **F-WF01** | 既存セクションを drag & drop で順序入れ替え | sort_order が DB に保存される |
| **F-WF02** | セクションの表示/非表示トグル | is_visible が即時反映 |
| **F-WF03** | セクションを 22 種類から追加 (ドロップダウン) | 新 row が末尾 sort_order で INSERT |
| **F-WF04** | セクションの複製 (同設定で隣接位置に追加) | 同 props の新 row INSERT |
| **F-WF05** | セクション削除 (確認ダイアログ付き) | DELETE / soft-delete |
| **F-WF06** | プレビュー (隣接 iframe) で編集中の draft が即時確認可能 | `<iframe src="/?_preview=token">` |

### 3.2 セクション内容編集 (SEO 強化)

各セクションに共通する SEO フィールド:

| フィールド | 説明 | UI |
|---|---|---|
| `heading_level` | H1 / H2 / H3 (デフォルト H2、最初の hero のみ H1) | radio |
| `heading` | 見出しテキスト (H1/H2 として描画) | text |
| `eyebrow` | 見出し上の小タグ (Cormorant italic) | text |
| `subheading` | 補助説明 | textarea |
| `seo_keywords` | このセクションが狙うキーワード (descriptive、検索エンジン直接シグナルではないが内部メモ) | tags |
| `image_alt_overrides` | 画像ごとの alt 文 (a11y / SEO) | per-image input |
| `internal_links` | このセクション内に挿入する内部リンク (label, href) の配列 | repeater |

### 3.3 LLMO 強化フィールド

各セクションに任意で追加できる LLMO ブロック:

| フィールド | 説明 | スキーマ出力 |
|---|---|---|
| `qa_pairs` | Q&A 配列 `[{question, answer}]` | FAQPage JSON-LD |
| `howto_steps` | 手順 `[{name, text, image_url}]` | HowTo JSON-LD |
| `citations` | 引用ソース `[{url, title, author, date}]` | CreativeWork.citation |
| `expertise_signals` | E-E-A-T シグナル (著者経歴、専門資格、更新日) | Article.author + Article.dateModified |
| `direct_answer` | LLM が引用しやすい 50-150 字の要約段落 | aria-describedby + ld+json `Question.acceptedAnswer.text` |

### 3.4 新セクションタイプ (LLMO 向け)

| section_type | 説明 | structured data |
|---|---|---|
| `faq_qa` | Q&A 形式の FAQ ブロック | FAQPage |
| `howto_steps_v2` | 手順ガイド (画像 + テキスト) | HowTo |
| `citations` | 出典・引用一覧 | CreativeWork.citation list |
| `expert_authorship` | 著者プロフィール + E-E-A-T 訴求 | Article.author + Person |
| `comparison_seo` | 比較表 (LLM が表として理解しやすい) | Table + ItemList |
| `tldr` | TL;DR / 要約ボックス (LLM がそのまま引用) | Question.acceptedAnswer |

### 3.5 ページ全体の SEO 設定

`landing_pages` テーブル新設 (既存は `landing_sections` のみで page-level 設定なし):

| カラム | 型 | 説明 |
|---|---|---|
| `page_key` | text PK | `home` / 将来の `/about` 等 |
| `seo_title` | text | `<title>` 上書き |
| `seo_description` | text | `<meta description>` |
| `seo_canonical` | text | canonical URL |
| `og_image_url` | text | OG image |
| `robots_index` | bool | noindex 切替え |
| `breadcrumb_label` | text | パンくずラベル |
| `updated_at` | timestamptz | freshness signal |

---

## 4. UI/UX 設計

### 4.1 レイアウト

```
┌─────────────────────────────────────────────────────────────┐
│ [LP 管理] [プレビュー▾] [公開]  ← 上部ツールバー            │
├──────────────────────────────┬──────────────────────────────┤
│ ◯ Section List (left 50%)    │ Live Preview (right 50%)     │
│  ─────────────────────────   │  ┌──────────────────────┐   │
│  ☰ ▣ hero        H1 ✏ ⏵ 👁︎  │  │                      │   │
│  ☰ ▣ story       H2 ✏ ⏵ 👁︎  │  │   <iframe>           │   │
│  ☰ ▣ features    H2 ✏ ⏵ 👁︎  │  │   /?_preview=token   │   │
│  ☰ ▣ faq_qa      H2 ✏ ⏵ 👁︎  │  │                      │   │
│  ☰ ▣ ...                     │  └──────────────────────┘   │
│                              │                              │
│  [+ セクション追加 ▾]         │  Page SEO ▾                 │
│                              │   title / desc / OG          │
└──────────────────────────────┴──────────────────────────────┘
```

### 4.2 セクション編集モーダル

各セクションをクリックで右側スライドオーバー:

- タブ: `内容` / `SEO` / `LLMO` / `詳細設定`
- `内容`: 既存の props 編集 (heading, body, items 等)
- `SEO`: heading_level radio, seo_keywords, alt overrides
- `LLMO`: qa_pairs / howto_steps / direct_answer / expertise_signals
- `詳細設定`: variant_key, variant_weight, sort_order direct edit

### 4.3 操作

- **drag**: ☰ ハンドルで縦方向 reorder → drop で sort_order を batch UPDATE
- **toggle**: 👁︎ アイコンで is_visible を即 toggle
- **edit**: ✏ または行クリックで編集モーダル
- **duplicate**: ⏵ で複製
- **delete**: 行末 ✕ → 確認ダイアログ → DELETE

---

## 5. データモデル変更

### 5.1 `landing_sections` への列追加

```sql
ALTER TABLE public.landing_sections
  ADD COLUMN heading_level text DEFAULT 'h2' CHECK (heading_level IN ('h1','h2','h3')),
  ADD COLUMN seo_keywords text[],
  ADD COLUMN qa_pairs jsonb,           -- [{question, answer}]
  ADD COLUMN howto_steps jsonb,        -- [{name, text, image_url}]
  ADD COLUMN citations jsonb,          -- [{url, title, author, date}]
  ADD COLUMN direct_answer text;
```

### 5.2 `landing_pages` (新規)

```sql
CREATE TABLE public.landing_pages (
  page_key text PRIMARY KEY,
  seo_title text,
  seo_description text,
  seo_canonical text,
  og_image_url text,
  robots_index boolean DEFAULT true,
  breadcrumb_label text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.landing_pages (page_key, seo_title, seo_description, breadcrumb_label)
VALUES ('home', NULL, NULL, 'ホーム');

ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY landing_pages_select_all ON public.landing_pages FOR SELECT USING (true);
CREATE POLICY landing_pages_admin_write ON public.landing_pages FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role='admin'));
```

---

## 6. 実装フェーズ

### F1: DB 拡張 + lib 拡張
- migration `20260427000001_lp_seo_llmo.sql` 作成
- `src/lib/landing.ts` に `landing_pages` の CRUD 関数追加
- `ResolvedSection` 型に新フィールド追加

### F2: 新セクションコンポーネント
- `FaqQaSection`, `HowtoStepsSection`, `CitationsSection`, `ExpertAuthorshipSection`, `TldrSection` を `sections.tsx` に追加
- 各セクションが対応 JSON-LD を出力 (`<script type="application/ld+json">`)
- `section-renderer.tsx` + `section-types.ts` に登録

### F3: セクションレベル JSON-LD 出力統合
- 既存セクション (FAQ 形式の testimonials 等) も該当する JSON-LD を吐く
- ページレベルでは `BreadcrumbList` を全ページに

### F4: 管理画面 UI 強化
- `editor.tsx` 全面改修
- `@dnd-kit/sortable` 導入で drag & drop
- セクション編集モーダル (タブ式: 内容 / SEO / LLMO)
- 右側 iframe ライブプレビュー
- 「+ セクション追加」ドロップダウン (22 + 新規 5 = 27 種類)
- ページ SEO 設定パネル

### F5: API / route 拡張
- `/api/admin/landing/sections/[id]` PATCH に新フィールド対応
- `/api/admin/landing/sections/[id]/duplicate` 新規 POST
- `/api/admin/landing/sections/reorder` 新規 POST (batch UPDATE)
- `/api/admin/landing/page/[key]` 新規 PATCH for landing_pages

### F6: テスト
- e2e/auth-admin-pages.spec.ts に LP 管理画面 drag & drop テスト追加
- 公開ページの JSON-LD 出力検証
- a11y 違反 0 維持

### F7: 本番デプロイ
- 本番 Supabase migration 適用
- Vercel auto-deploy
- 反映確認

---

## 7. 受け入れ基準

| AC | 内容 | 検証 |
|---|---|---|
| **AC-LP-A01** | 管理画面で drag-and-drop によりセクション順序変更可能 | DB の sort_order が変わる |
| **AC-LP-A02** | セクションの表示/非表示が toggle で即反映 | is_visible 変更後、本番 LP で消える/現れる |
| **AC-LP-A03** | 27 種類のセクションを追加できる | dropdown に 27 件 |
| **AC-LP-A04** | セクション複製が動作 | 元と同 props の row が増える |
| **AC-LP-A05** | LP に FAQ セクション追加 → `<script type="application/ld+json">` に FAQPage が出力 | curl で確認可 |
| **AC-LP-A06** | LP に HowTo セクション追加 → HowTo schema が出力 | curl で確認可 |
| **AC-LP-A07** | TL;DR セクションが `direct_answer` を持つ場合 LLM 引用しやすい構造 | Q.acceptedAnswer.text JSON-LD |
| **AC-LP-A08** | ページ SEO 設定で title/description/OG image を変更できる | 本番 LP の `<title>` 反映 |
| **AC-LP-A09** | 編集中の draft が右側 iframe で即時プレビュー | iframe reload で draft 反映 |
| **AC-LP-A10** | a11y 違反 (critical) ゼロ | axe スキャン |
| **AC-LP-A11** | heading hierarchy 正しい (h1 一つのみ) | crawler simulation |
| **AC-LP-A12** | TS/Lint/vitest/e2e 全 pass | CI green |

---

## 8. 影響範囲

| ファイル | 変更内容 |
|---|---|
| `supabase/migrations/20260427000001_lp_seo_llmo.sql` (新規) | DB 拡張 + landing_pages |
| `src/lib/landing.ts` | landing_pages 関数, ResolvedSection 型拡張 |
| `src/components/landing/sections.tsx` | 5 セクション追加 + JSON-LD 出力 |
| `src/components/landing/section-renderer.tsx` | 新セクション登録 |
| `src/components/landing/section-types.ts` | 新セクションラベル |
| `src/app/dashboard/admin/landing/editor.tsx` | 全面改修 |
| `src/app/dashboard/admin/landing/page.tsx` | landing_pages 取得追加 |
| `src/app/api/admin/landing/sections/[id]/route.ts` | 新フィールド対応 |
| `src/app/api/admin/landing/sections/[id]/duplicate/route.ts` (新規) | 複製 API |
| `src/app/api/admin/landing/sections/reorder/route.ts` (新規) | reorder batch API |
| `src/app/api/admin/landing/page/[key]/route.ts` (新規) | page SEO API |
| `src/app/page.tsx` | `landing_pages` の SEO 反映 |
| `src/app/layout.tsx` | dynamic metadata 対応の場合は generateMetadata 化 |
| `package.json` | `@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities` 追加 |
| `e2e-prod/lp-admin.spec.ts` (新規) | 管理画面試験 |

---

## 9. 工数見積

| F | 内容 | 想定 |
|---|---|---|
| F1 | DB 拡張 | 15 分 |
| F2 | 5 新セクション + JSON-LD | 60 分 |
| F3 | JSON-LD 統合 | 20 分 |
| F4 | 管理画面 UI 全面改修 | 90 分 |
| F5 | API ルート | 30 分 |
| F6 | テスト | 30 分 |
| F7 | デプロイ | 15 分 |
| **合計** | | **約 4 時間** |

---

## 10. 制約 / リスク

- `@dnd-kit` 追加でバンドル ~30KB 増 (gzip)
- `landing_sections` 既存 row への新カラム NULL 許容で migration 安全
- LLMO はまだ業界標準が定まっていないため schema 出力は保守的に (既存 schema.org を活用)
- 本番 migration は idempotent (`IF NOT EXISTS`) で安全に
- 既存 e2e は影響受けない (公開 LP 表示は後方互換)

---

**Status**: 仕様確定 → 実装開始 (一気通貫)
