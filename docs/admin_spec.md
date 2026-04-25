# 管理画面 最適化仕様書 (Admin Dashboard Specification)

**生成者**: Planner（10 専門家チーム議論結果）
**生成日**: 2026-04-25
**ターゲットユーザー**: admin ロール (運営チーム)
**書き込み権限**: Planner / Change Request のみ

---

## 0. 議論メンバー（10 仮想専門家）

| # | ロール | 視点 |
|---|---|---|
| E1 | **CEO / プロダクトオーナー** | 戦略 KPI、成長指標、プラットフォーム健全性 |
| E2 | **オペレーション責任者** | カウンセラー審査、品質管理、SLA |
| E3 | **カスタマーサポート (CS)** | ユーザー問合せ、トラブル仲裁、返金 |
| E4 | **コンプライアンス / 法務** | 規約管理、通報対応、トラブル証跡 |
| E5 | **マーケティング** | 新規獲得、リテンション、コンバージョン |
| E6 | **コンテンツマネージャー** | コラム、メールテンプレ、お知らせ |
| E7 | **財務 / 経理** | 売上、カウンセラー報酬、返金、税務 |
| E8 | **データアナリスト** | ファネル、コホート、リテンション |
| E9 | **セキュリティ** | ユーザー BAN、不正検知、アクセスログ |
| E10 | **エンジニア / SRE** | システムヘルス、エラー監視、メール送信状況 |

---

## 1. 議論サマリ：必要機能の総覧

### 1.1 ダッシュボード（KPI 概要）— E1, E5, E8

現状の 4 メトリクス（総ユーザー / アクティブ counselor / 総予約 / 収益）に加えて:

- **MAU/DAU**（直近 30/1 日のアクティブユーザー）
- **当月予約数 / 前月比**
- **当月収益 / 前月比**
- **コンバージョン率**（訪問 → 登録 → 初回予約）
- **キャンセル率**（pending→cancelled / confirmed→cancelled）
- **平均レビュースコア**（プラットフォーム全体）
- **ファネル**: 登録 → 初回予約 → 完了 → レビュー
- **直近 7 日のアクティビティ・グラフ**

### 1.2 ユーザー管理 — E2, E3, E9

- **一覧** (検索・フィルタ: role / created_at / 最終ログイン)
- **詳細**（メアド、role、登録日、予約履歴、レビュー、wallet 残高）
- **アクション**:
  - role 変更（client ↔ counselor ↔ admin）
  - **BAN / UNBAN**（is_banned 列追加）
  - パスワードリセットメール再送
  - 削除（CASCADE 確認ダイアログ）

### 1.3 カウンセラー審査 — E2, E4

- **審査待ち一覧** (`screening_status = 'pending'`)
- **詳細**（職歴、リファレンス、ビデオ面接 URL、Personality Matrix 32 自己評価）
- **アクション**:
  - 承認 (`approved` + `is_active=true`)
  - 却下 (`rejected` + 理由メール送信)
  - 一時停止 (`suspended`)
- **既承認カウンセラーの **
  - レベル変更（starter→regular→senior→master）
  - 強制 is_active 変更

### 1.4 予約管理 — E3, E7

- **全予約一覧**（フィルタ: status / 期間 / counselor / client）
- **詳細**（メモ、決済状況、meeting_url、レビュー有無）
- **アクション**:
  - 強制ステータス変更（CS 仲介時）
  - 返金（Stripe 連携）
  - メモ追記（運営側コメント、ユーザー非公開）

### 1.5 決済 / 売上管理 — E7

- **当月収益サマリ**（合計、プラットフォーム手数料、カウンセラー支払予定額）
- **取引一覧** (`payments` テーブル)
- **カウンセラー別収益レポート**（CSV エクスポート）
- **返金管理**（Stripe API 経由）
- **ウォレット監視**（不審な大額チャージ、ボーナス付与履歴）

### 1.6 コンテンツ管理 — E6

- **コラム CRUD**
  - 一覧（公開状態、カテゴリ、著者）
  - 編集（slug, title, body, excerpt, category, published_at）
  - **下書き / 公開** トグル
  - プレビュー
- **カテゴリマスタ管理**（categories テーブル）
- **メールテンプレ表示**（Supabase Auth テンプレへのリンク）
- **お知らせ / バナー** （announcements テーブル新規）
  - サイト全体の上部バナー
  - 期間指定（公開開始/終了日時）

### 1.7 通報 / トラブル対応 — E3, E4

- **通報一覧** (reports テーブル新規)
  - 通報者、対象（counselor or session）、理由、ステータス
- **アクション**:
  - 対象を一時停止
  - 警告送信
  - 棄却

### 1.8 レビュー管理 — E2, E4

- **レビュー一覧**（フィルタ: 低評価 ≤2★ / 通報あり）
- **アクション**:
  - **非表示**（不適切コンテンツ、is_hidden 列追加）
  - 削除（証跡保持のため soft delete）
  - カウンセラーから返信を促す

### 1.9 メール送信状況 — E10

- **直近送信ログ**（Brevo / Resend API より、または notifications テーブル経由）
- **失敗ログ**（bounce, blocked）

### 1.10 システムヘルス — E10

- **Vercel デプロイ状況**（最新コミット、状態）
- **Sentry エラー件数**（直近 24h）
- **Supabase 接続状況**（簡易 ping）
- **Stripe webhook 状況**（直近 24h の成功/失敗件数）

### 1.11 SEO 管理 — E5, E6, E10 (新規追加)

オーガニック流入の最大化のため、運営側で各ページの SEO 要素を管理できるようにする:

- **ページ別メタ情報管理** (site_seo テーブル)
  - title, description, keywords
  - OGP image, OGP title, OGP description
  - Twitter Card type, image
  - canonical URL
- **対象ページ**:
  - / (Landing)
  - /about, /about/screening
  - /counselors (一覧)
  - /counselors/[id] (各カウンセラー詳細 — 動的生成)
  - /column, /column/[slug] (各記事)
  - /tools/personality, /tools/tarot, /tools/compatibility
  - /for-counselors
- **構造化データ (JSON-LD) 自動生成**:
  - Organization (会社情報)
  - WebSite + SearchAction (サイト内検索)
  - Person (各カウンセラー詳細ページ)
  - Article (各コラム記事)
  - BreadcrumbList (パンくず)
  - Review / AggregateRating (カウンセラーレビュー集約)
- **sitemap.xml 自動生成**
  - 全公開ページを動的列挙 (/sitemap.xml)
  - 各 counselor / column / tool ページを含める
  - 最終更新日を反映
- **robots.txt 管理**
  - 編集可能 UI（環境別: dev で全 disallow、prod で許可）
- **canonical URL 設定**
  - 重複コンテンツ対策（旧 URL → 新 URL の rel=canonical）
- **noindex 制御**
  - 個別ページに noindex フラグ
  - dashboard 系・login 系は自動 noindex
- **Google Search Console 統合**
  - 認証ファイル / メタタグ管理
  - サイトマップ自動 submit (ドキュメント案内)
- **検索パフォーマンス可視化**
  - 主要キーワードの順位表示（手動入力 or GSC API）
  - クリック率・表示回数

### 1.12 アクセスログ — E9

- **admin 操作ログ** (admin_audit_log テーブル新規)
  - 誰が・いつ・何を操作したか
  - role 変更、BAN、コラム公開等の重要操作を記録

---

## 2. 優先度マトリクス（実装順）

| 優先 | 機能 | 理由 | 工数感 |
|---|---|---|---|
| **P0** | KPI ダッシュボード強化 | 既存ページの補強、即値あり | S |
| **P0** | ユーザー管理（一覧 + role 変更 + BAN） | 運用必須、トラブル対応の核 | M |
| **P0** | カウンセラー審査（承認/却下） | 新規受け入れに必須 | M |
| **P0** | 予約管理（一覧 + 強制ステータス変更） | CS 介入に必須 | M |
| **P1** | 通報対応 | コンプライアンス | M |
| **P1** | コラム CRUD | コンテンツ運用 | M |
| **P1** | レビュー管理（非表示） | 不適切コンテンツ対応 | S |
| **P2** | 決済・売上レポート | 月次運用 | M |
| **P2** | お知らせバナー | マーケ施策 | S |
| **P1** | **SEO: sitemap.xml + robots.txt + 構造化データ** | オーガニック流入の基盤 | M |
| **P2** | **SEO: ページ別メタ情報管理 UI** | コンテンツ運用に不可欠 | M |
| **P3** | 監査ログ | ガバナンス | M |
| **P3** | システムヘルス | SRE 観点 | M |

---

## 3. 受け入れ基準（Playwright 検証可能）

### 3.1 KPI ダッシュボード

**AC-AD-K01**: `/dashboard/admin` で 8 メトリクス（既存4 + MAU/当月予約/当月収益/平均レビュー）が表示される
**AC-AD-K02**: 「直近 7 日のアクティビティ」グラフが表示される（簡易 bar / line）
**AC-AD-K03**: 「最近の予約 N 件」「新規ユーザー N 件」がそれぞれ最低 5 件表示される（データある場合）

### 3.2 ユーザー管理

**AC-AD-U01**: `/dashboard/admin/users` で全ユーザー一覧が paginated 表示される
**AC-AD-U02**: 検索ボックスで email / display_name 部分一致検索可
**AC-AD-U03**: role フィルタ（all / admin / counselor / client）動作
**AC-AD-U04**: 各行に「詳細」ボタン → `/dashboard/admin/users/[id]` 遷移
**AC-AD-U05**: 詳細ページで role を変更し「保存」 → DB 反映
**AC-AD-U06**: 詳細ページで「BAN」ボタン → 確認ダイアログ → `is_banned=true` セット
**AC-AD-U07**: BAN 済みユーザーは login 試行時に拒否される

### 3.3 カウンセラー審査

**AC-AD-C01**: `/dashboard/admin/counselors` で全 counselor 一覧表示
**AC-AD-C02**: `screening_status` で絞り込み（pending/approved/suspended）
**AC-AD-C03**: 各行に「承認」「却下」「停止」ボタン
**AC-AD-C04**: 承認クリック → `screening_status='approved' AND is_active=true`
**AC-AD-C05**: レベル変更ドロップダウン → 即反映

### 3.4 予約管理

**AC-AD-B01**: `/dashboard/admin/bookings` で全予約一覧（最新順）
**AC-AD-B02**: フィルタ: status / 日付範囲 / counselor 名
**AC-AD-B03**: 詳細ページで予約情報・決済状況・meeting_url 表示
**AC-AD-B04**: 「強制ステータス変更」ドロップダウン → DB 反映
**AC-AD-B05**: 「返金実行」ボタン → Stripe API 経由で返金 → status='refunded'

### 3.5 通報対応

**AC-AD-R01**: `/dashboard/admin/reports` で通報一覧（pending 優先）
**AC-AD-R02**: 詳細ページで通報内容・対象・通報者表示
**AC-AD-R03**: アクション: 対象停止 / 警告 / 棄却

### 3.6 コラム CRUD

**AC-AD-CL01**: `/dashboard/admin/columns` で全コラム一覧（下書き含む）
**AC-AD-CL02**: 「新規作成」ボタン → エディタページ
**AC-AD-CL03**: タイトル・本文・カテゴリ・公開日入力
**AC-AD-CL04**: 「下書き保存」「公開」両対応

### 3.7 レビュー管理

**AC-AD-RV01**: `/dashboard/admin/reviews` で全レビュー一覧
**AC-AD-RV02**: フィルタ: 低評価（≤2★） / 通報あり
**AC-AD-RV03**: 「非表示」トグル → `is_hidden` フラグ更新
**AC-AD-RV04**: 公開ページから非表示レビューが消えること

### 3.8 SEO

**AC-AD-S01**: `/sitemap.xml` が公開され、全公開ページ + counselor + column を含む XML を返す
**AC-AD-S02**: `/robots.txt` が公開され、本番では `Allow: /`、preview では `Disallow: /`
**AC-AD-S03**: 各カウンセラー詳細ページに `<script type="application/ld+json">` で `Person` + `Review` が出力される
**AC-AD-S04**: 各コラム詳細ページに `Article` 構造化データが出力される
**AC-AD-S05**: `/dashboard/admin/seo` で各ページのメタ情報が編集可能（site_seo テーブル経由）
**AC-AD-S06**: dashboard / login / register に `<meta name="robots" content="noindex">` が出力される

### 3.9 監査ログ

**AC-AD-A01**: 重要操作（role変更/BAN/コラム公開/返金）が `admin_audit_log` に記録される
**AC-AD-A02**: `/dashboard/admin/audit` で時系列表示

---

## 4. 必要な DB スキーマ追加

```sql
-- profiles に BAN フラグ
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- reviews に非表示フラグ
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

-- 通報テーブル
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('counselor','session','review','user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','resolved','dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- お知らせ
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info','warning','critical')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEO ページ別メタ情報
CREATE TABLE IF NOT EXISTS site_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE,         -- '/' or '/about' or '/counselors/[id]' (template)
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  canonical_url TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  custom_jsonld JSONB,                    -- 任意の追加 JSON-LD
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 監査ログ
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,           -- 'user.ban', 'user.role_change', 'column.publish', 'booking.refund' 等
  target_type TEXT,               -- 'user' / 'counselor' / 'booking' / 'column' / 'review'
  target_id UUID,
  before JSONB,                   -- 変更前の状態
  after JSONB,                    -- 変更後の状態
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: 全テーブル admin のみ書込/読込（profiles.role = 'admin'）
-- あるいは service_role 経由のみ
```

---

## 5. ルーティング設計

```
/dashboard/admin                 - KPI ダッシュボード (既存、強化)
/dashboard/admin/users           - ユーザー一覧
/dashboard/admin/users/[id]      - ユーザー詳細・編集
/dashboard/admin/counselors      - カウンセラー一覧（審査含む）
/dashboard/admin/counselors/[id] - 詳細・承認
/dashboard/admin/bookings        - 予約一覧
/dashboard/admin/bookings/[id]   - 予約詳細・操作
/dashboard/admin/payments        - 決済・売上
/dashboard/admin/columns         - コラム CRUD
/dashboard/admin/columns/new     - 新規作成
/dashboard/admin/columns/[id]    - 編集
/dashboard/admin/reviews         - レビュー管理
/dashboard/admin/reports         - 通報対応
/dashboard/admin/announcements   - お知らせ管理
/dashboard/admin/seo             - SEO 管理（メタ情報編集）
/dashboard/admin/audit           - 監査ログ
/dashboard/admin/health          - システムヘルス

# 公開エンドポイント
/sitemap.xml                     - 動的 sitemap
/robots.txt                      - 環境別 robots
```

---

## 6. 既存実装との差分

| 既存 | 状態 | 必要対応 |
|---|---|---|
| `/dashboard/admin` (KPI 4 個) | あり | KPI 拡張 |
| `/dashboard/admin/users` | **無し** | 新規 |
| `/dashboard/admin/counselors` | **無し** | 新規 |
| `/dashboard/admin/bookings` | **無し** | 新規 |
| 通報・お知らせテーブル | **無し** | DB migration + UI |
| 監査ログテーブル | **無し** | DB migration + 仕組み |

---

## 7. 評価スコープと除外

### 含む（P0-P1）
- KPI ダッシュボード強化
- ユーザー管理
- カウンセラー審査
- 予約管理
- 通報対応
- コラム CRUD
- レビュー管理
- DB スキーマ追加 + RLS

### 除外（次サイクル候補）
- 監査ログの詳細 UI（記録のみ実装、表示は後回し）
- システムヘルス（Vercel API 統合は後）
- お知らせ表示の Site-wide バナー（管理 UI のみ）

---

## 8. 改訂履歴

- **2026-04-25 Planner (10 expert team)**: 初版作成、P0-P1 を実装対象に決定
