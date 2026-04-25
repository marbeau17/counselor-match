# 最適化仕様書 — Counselor Match Platform

**対象リポジトリ**: `counselor-match/`
**生成者**: Planner
**生成日**: 2026-04-24
**ソース・オブ・トゥルース**: 現状のコードベース（`src/`, `supabase/migrations/`）および既存 E2E テスト（`e2e/`）
**更新権限**: Planner / Change Request のみ（Generator・Evaluator は読み取り専用）

---

## 0. プラットフォーム概要

ホリスティック心理学 × スピリチュアルカウンセリング × 占術ツールを統合した、B2C マッチングプラットフォーム。

- **悩みカテゴリ (6)**: 恋愛, 仕事, 人生の目的, 家族, 自己理解, グリーフ
- **メソッド (11)**: holistic(3), spiritual(3), divination(4) — `src/lib/taxonomy.ts` 参照
- **カウンセラー階層 (4)**: `starter` → `regular` → `senior` → `master`
- **クライアント成長段階 (3)**: `shoshin`（初心）→ `shinka`（深化）→ `musubi`（結）
- **決済**: Stripe PaymentIntent + ウォレット（前払いポイント制）
- **レビュー**: 5軸（`insight` / `empathy` / `practicality` / `approachability` / `awareness`）

---

## 1. 起動手順（Evaluator 必読）

### 1.1 前提環境
- Node.js / Bun（`~/.bun/bin/bun`）
- ポート 4000 が空いていること

### 1.2 起動コマンド（ポート 4000 固定）
```bash
cd /Users/yasudaosamu/Desktop/codes/spiritual-counselor/counselor-match
NEXTAUTH_SECRET="e2e-dev-secret-for-testing-only-please-change" NEXTAUTH_URL="http://localhost:4000" PORT=4000 bun run next dev -p 4000
```

### 1.3 検証前チェック
- Supabase 環境変数は未設定でも起動可能（`mock-data.ts` にフォールバックする）
- Stripe 環境変数は遅延初期化のためビルド時エラーにならない（`577b8ad` 参照）
- 既存ポート占有の解消: `lsof -ti:4000 | xargs -r kill`

### 1.4 ベース URL
`http://localhost:4000`

---

## 2. ルート一覧

### 公開ページ（認証不要）
| Path | 目的 |
|---|---|
| `/` | ランディング |
| `/about` | 企業情報・ホリスティック心理学 4 層 |
| `/about/screening` | カウンセラー選考基準の透明性ページ |
| `/counselors` | カウンセラー検索・フィルタ |
| `/counselors/[id]` | カウンセラー詳細・レビュー |
| `/column` | コラム一覧（category フィルタ） |
| `/column/[slug]` | コラム詳細 |
| `/tools/personality` | パーソナリティ診断 |
| `/tools/tarot` | タロット 1 枚引き |
| `/tools/compatibility` | 相性診断 |
| `/login` | ログイン |
| `/register` | 新規登録 |

### 認証必須ページ
| Path | ロール制約 | 目的 |
|---|---|---|
| `/dashboard` | all (auto-redirect) | ロール別にリダイレクト |
| `/dashboard/client` | client | 予約・履歴 |
| `/dashboard/counselor` | counselor | 予約承認・収益 |
| `/dashboard/counselor/availability` | counselor | 受付モード設定 |
| `/dashboard/admin` | admin | KPI |
| `/dashboard/journey` | all | 成長段階表示 |
| `/dashboard/wallet` | all | ポイント残高・履歴 |
| `/booking/[id]` | 認証 warning 表示、未認証でも閲覧可 | 予約フォーム |

### API ルート
| Method | Path | 用途 |
|---|---|---|
| POST | `/api/auth/signout` | ログアウト |
| POST | `/api/bookings` | 予約＋ Stripe PaymentIntent 作成 |
| POST | `/api/counselor/availability` | 受付モード更新 |
| POST | `/api/wallet/signup-bonus` | サインアップボーナス付与 |
| POST | `/api/webhooks/stripe` | Stripe Webhook 受信 |
| GET | `/auth/callback` | OAuth リダイレクト先 |

---

## 3. 受け入れ基準（Playwright 検証可能）

> 以下の criteria は Evaluator が MCP Playwright で検証する際の合否判定根拠である。

### 3.1 Landing (`/`)

**AC-L01**: `h1` に「占いを超えた、」「魂のためのホリスティックカウンセリング」の両方のテキストが含まれる。
**AC-L02**: Badge テキスト「Holistic × Spiritual Counseling」が表示される。
**AC-L03**: Button「カウンセラーを探す」クリックで `/counselors` へ遷移する。
**AC-L04**: Button「無料診断を試す」クリックで `/tools/personality` へ遷移する。
**AC-L05**: 「ホリスティック心理学」「Soul Mirror Law」「守られた対話」の 3 枚の Card が表示される。
**AC-L06**: 4 つのステップ（`STEP 01`〜`STEP 04`）が順番に表示される。
**AC-L07**: 無料ツールの 3 枚 Card（パーソナリティ／タロット／関係性リフレクション）が表示され、それぞれリンクが有効。

### 3.2 About (`/about`, `/about/screening`)

**AC-A01**: `/about` に 4 層（Body, Mind, Heart, Spirit）の Card が表示される。
**AC-A02**: `/about` に運営会社「合同会社AICREO NEXT」が表記される。
**AC-A03**: `/about/screening` の `h1` に「カウンセラー選考・レベル基準」が表示される。
**AC-A04**: `/about/screening` に選考プロセスの 6 ステップが順序付きで表示される。
**AC-A05**: `/about/screening` にレベル昇格基準として 4 段階の階層 Card が表示される。各 Card の見出しは日本語名（`新人` / `レギュラー` / `シニア` / `マスター`）で、サブテキストに英語キー（`regular` / `senior` / `master`）または "Level REGULAR / SENIOR / MASTER" Badge が併記される。
**AC-A06**: `/about/screening` のフッター Button「この基準をクリアしたカウンセラーと話す」が `/counselors` へ遷移する。

### 3.3 Counselors 一覧 (`/counselors`)

**AC-C01**: 初期表示で「{N}名のカウンセラー」が表示される（`N >= 1`）。
**AC-C02**: サイドバーの検索 Input（placeholder `名前・自己紹介...`）にテキストを入力すると、カウンセラー Card の件数が変化する（もしくは 0 件時に「条件に合うカウンセラーが見つかりませんでした」が表示される）。
**AC-C03**: Checkbox「今すぐ話せる人のみ」をチェックすると、`availability_mode === "machiuke"` のカウンセラーのみが残る。
**AC-C04**: Checkbox「恋愛・パートナーシップ」チェックで Button「フィルターをクリア (1)」が出現する。さらに methodology を 1 つチェックすると「フィルターをクリア (2)」に更新される。
**AC-C05**: カウンセラー Card には、氏名、階層 Badge、評価（★ + 数値）、セッション回数、bio、specialties Badge、料金が表示される。
**AC-C06**: Card をクリックすると `/counselors/[id]` へ遷移する。
**AC-C07**: モバイル幅では Button「フィルター」が表示され、クリックでフィルタパネルが開閉する。

### 3.4 Counselor 詳細 (`/counselors/[id]`)

**AC-CD01**: 有効な ID で訪問した場合、アバター、氏名、階層 Badge（「スターター」「レギュラー」「シニア」「マスター」のいずれか）、title が表示される。
**AC-CD02**: Bio、Specialties、Certifications の 3 セクションが表示される。
**AC-CD03**: Reviews セクションに星評価とコメントが少なくとも 1 件表示される。
**AC-CD04**: 「相談者の声」セクションに 5 軸（insight, empathy, practicality, approachability, awareness）のスコア表示が存在する（data available case）。
**AC-CD05**: サイドバー Card に時給（`¥` プレフィクス + 金額 + 「/ 50分セッション」）が表示される。
**AC-CD06**: `on_demand_enabled === true` かつ `price_per_minute > 0` のカウンセラーでは「¥{price_per_minute}/分 (待機中価格)」が表示される。
**AC-CD07**: `availability_mode === "machiuke"` で Badge「⚡ 今すぐ通話可能」が表示される。
**AC-CD08**: Button「予約に進む」クリックで `/booking/[id]` へ遷移する。
**AC-CD09**: Sidebar 下部に注記「※ 予約にはログインが必要です」が表示される。
**AC-CD10**: 存在しない ID で訪問した場合、404 もしくは「カウンセラーが見つかりません」相当の画面が表示される（500 系エラーは NG）。

### 3.5 Booking (`/booking/[id]`)

**AC-B01**: 未認証で訪問した場合、Alert「予約にはログインが必要です。」と `/login` / `/register` へのリンクが表示される。
**AC-B02**: Button「予約を確定する」は `session_type`, `date`, `time` が揃うまで disabled である。
**AC-B03**: セッション形式 3 個（オンライン／チャット／電話）のトグル選択で、サイドバー「予約内容」の「セッション形式」欄が更新される。
**AC-B04**: 日付 Input は `min={tomorrow}` で、過去日付は入力不可。
**AC-B05**: 時間 Select には 9:00〜20:30 の 30 分刻みが含まれる。
**AC-B06**: 認証済みユーザーが全項目入力して「予約を確定する」クリック → POST `/api/bookings` が成功すれば Success Card（`h1`「予約が完了しました」、Button「ダッシュボードへ」「カウンセラー一覧へ」）が表示される。
**AC-B07**: 500 エラーやブラウザクラッシュが発生しない（Monkey Test）。

### 3.6 Column (`/column`, `/column/[slug]`)

**AC-CL01**: `/column` で 4 つのカテゴリ chip（「全て」「founder columns」「SEO記事」「カウンセラー」「体験談」のいずれか複数）が表示され、初期は「全て」が active（`bg-emerald-600`）。
**AC-CL02**: 「SEO記事」chip クリックで `category=seo` のコラムのみ表示される（または empty state 表示）。
**AC-CL03**: コラム Card には Badge（category）、公開日（`YYYY.MM.DD` 形式）、タイトル、抜粋が表示される。
**AC-CL04**: Card クリックで `/column/[slug]` へ遷移する。
**AC-CL05**: `/column/[slug]` の Article に `h1`, 本文（whitespace-pre-wrap による段落）が表示される。
**AC-CL06**: `/column/[slug]` 下部に「関連するコラム」セクションに同カテゴリの Card が最大 3 件表示される（存在しなければセクションは出ないか空）。
**AC-CL07**: 存在しない slug で 500 エラーが発生しない。

### 3.7 Tools — Personality (`/tools/personality`)

**AC-T-P01**: 初期表示でフォーム Card（`h1`「本格パーソナリティ診断」、Label「生年月日（必須）」、Input `type=date`、Button「診断する」）が表示される。
**AC-T-P02**: 生年月日未入力で Button「診断する」クリックしても result が出ない（HTML5 `required` で block）。
**AC-T-P03**: 生年月日入力 → Button「診断する」クリック → Result Card にアーキタイプ（Seeker / Healer / Creator のいずれか）と日本語訳が表示される。
**AC-T-P04**: Result Card に「強み」「向き合いたい影の側面」「内省のための問い」の 3 セクションが表示される。
**AC-T-P05**: Result Card の Button「Personality Matrix 32 認定カウンセラーを探す」クリックで `/counselors?methodology=personality_matrix_32` へ遷移する。
**AC-T-P06**: Button「もう一度診断する」クリックで初期フォーム画面に戻る。

### 3.8 Tools — Tarot (`/tools/tarot`)

**AC-T-T01**: Textarea に 10 文字未満の入力で Button「カードを引く」クリックしても Result が表示されず、エラー文「問いを10文字以上で記してみてください。」が表示される。
**AC-T-T02**: Textarea に 10 文字以上入力 → Button「カードを引く」クリック → Result Section が表示される。
**AC-T-T03**: Result Section にカードの英語名（uppercase）、日本語名（`h2`）、prompt（`blockquote`）、grounding hint が含まれる。
**AC-T-T04**: 同じ質問・同じ日付なら同じカードが引かれる（決定性）。
**AC-T-T05**: Result 下部の Link「カードについてもっと深く探る」は `/counselors?methodology=tarot` へ遷移する。

### 3.9 Tools — Compatibility (`/tools/compatibility`)

**AC-T-C01**: 両方の生年月日が入力されるまで Button「診断する」が disabled である。
**AC-T-C02**: 両方の生年月日 + 関係性（任意）を指定 → 診断クリック → Result Card に 50〜100 の整数スコアと Badge（「共鳴」「調和」「学び合い」のいずれか）が表示される。
**AC-T-C03**: 関係性に「恋人」を選んだ場合と「仕事」を選んだ場合で Result の interpretation 文と prompts ul が異なる。
**AC-T-C04**: Result 下部 Button「関係性を深く見つめるカウンセリングへ」は `/counselors?concern=family` へ遷移する。

### 3.10 Authentication (`/login`, `/register`)

**AC-AU01**: `/login` に Input（メール、パスワード）、Button「ログイン」、Button「Googleでログイン」、Link「新規登録」が表示される。
**AC-AU02**: `/register` に Input（お名前、メール、パスワード minLength=8）、Button「無料登録」、Button「Googleで登録」が表示される。
**AC-AU03**: `/register` 登録成功時、Success 画面に「確認メールを送信しました」と「¥3,000 のウェルカム・ポイント」「14日間有効」が表示される（Supabase が利用可能な場合）。
**AC-AU04**: 認証失敗時、エラーメッセージが表示され、500 エラーは発生しない。

### 3.11 Dashboard — Client (`/dashboard/client`)

**AC-DC01**: 未認証で `/dashboard/client` 訪問 → `/login` へリダイレクト。
**AC-DC02**: 認証済み client 訪問 → `h1`「こんにちは、{表示名}さん」が表示される。
**AC-DC03**: 3 枚の Stat Card「予約中」「セッション履歴」「カウンセラーを探す」が表示される。「カウンセラーを探す」Card のリンクは `/counselors` へ遷移する。
**AC-DC04**: 「予約一覧」Card に pending + confirmed bookings が少なくとも 0 件以上表示される（empty state: 「予約はありません」）。

### 3.12 Dashboard — Counselor (`/dashboard/counselor`, `/dashboard/counselor/availability`)

**AC-DCO01**: counselor ロールで `/dashboard/counselor` 訪問 → `h1`「カウンセラーダッシュボード」と 4 枚の Stat Card（承認待ち / 予約確定 / 総セッション / 総収益）が表示される。
**AC-DCO02**: 承認待ちがある場合、各 row に Button「承認」「辞退」が存在する（表示のみ検証、実行は scope 外）。
**AC-DCO03**: `/dashboard/counselor/availability` に受付モード Radio 3 択（オフライン / 予約受付中 / 待機中）、Checkbox「オンデマンド通話を受け付ける」、条件付き Input「分あたりの料金」、Button「保存」が表示される。
**AC-DCO04**: Radio「待機中」選択 + Checkbox チェック + Input に整数入力 + Button「保存」クリック → Notice「保存しました」が green 背景で表示される（API 呼び出し成功時）。

### 3.13 Dashboard — Admin (`/dashboard/admin`)

**AC-DA01**: admin ロールで訪問 → `h1`「管理者ダッシュボード」と 4 枚の Stat Card（総ユーザー数 / アクティブカウンセラー / 総予約数 / プラットフォーム収益）が表示される。
**AC-DA02**: 非 admin ロールで訪問した場合、適切にリダイレクトされるか 403 相当の挙動（500 は NG）。

### 3.14 Dashboard — Journey (`/dashboard/journey`)

**AC-DJ01**: 認証済みで訪問 → `h1`「わたしの旅路」が表示される。
**AC-DJ02**: 現在ステージ Card に Badge、description、受けられる特典（`ul`）が表示される。
**AC-DJ03**: Progress tracker Grid に 3 段階（`shoshin` / `shinka` / `musubi`）の Card が表示され、各 Card に Badge（「現在」「達成済み」「未到達」のいずれか）が付く。
**AC-DJ04**: 次のステージが存在する場合、Progress bar が各 requirement について表示される（形式: `{label}: {current} / {required}`）。

### 3.15 Dashboard — Wallet (`/dashboard/wallet`)

**AC-DW01**: 認証済みで訪問 → `h1`「ポイントウォレット」、残高 Card（`¥` + 金額）が表示される。
**AC-DW02**: TopUp Card に 3 つの Button「¥5,000 チャージ」「¥10,000 チャージ」「¥30,000 チャージ」が表示される。
**AC-DW03**: 取引履歴 Card に Table（th: 日付 / 種別 / 金額 / メモ）が表示される。取引がない場合は「取引履歴はありません」が表示される。
**AC-DW04**: signup_bonus 付与済みユーザーでは種別「新規登録ボーナス」、金額「+¥3,000」の row が存在する。

### 3.16 Navigation / Layout（全ページ共通）

**AC-N01**: すべての公開ページで Header / Footer が表示される。
**AC-N02**: Header 内の主要リンクが有効（ランディング / カウンセラー / コラム / ログイン or ダッシュボード）。
**AC-N03**: 全ページで 500 エラーが発生しない。
**AC-N04**: 全ページで `dark:` クラスによるダークモード対応を確認（CLAUDE.md グローバル要件）。

### 3.17 非機能要件

**AC-NF01**: LCP 3.0 秒以内（ローカル dev、モックデータ利用時）。
**AC-NF02**: 単純ページ遷移でブラウザコンソールに `Error:` 系メッセージが出力されない（MCP Playwright `get_console_messages` で確認）。
**AC-NF03**: Tailwind `dark:` class を含むコンポーネントが主要レイアウトに存在する。

### 3.18 静的検証・単体テスト

**AC-Q01 (TypeScript)**: `bunx tsc --noEmit` を実行し、`src/` 配下の型エラーが 0 件であること。`__tests__/*.test.tsx` の vitest globals 解決済み（`tsconfig.json` の `types` に `vitest/globals` 追加 or import で解消）。
**AC-Q02 (Lint)**: `bun run lint` を実行し、エラー 0 件、警告は許容するが新規追加コードでは 0 を目標。
**AC-Q03 (Unit Tests)**: `bun run test` を実行し、すべての vitest テストが通ること。
**AC-Q04 (E2E Tests)**: `bun run test:e2e` を実行し、`e2e/*.spec.ts` の既存スイートが通ること（dev server が起動している前提）。

### 3.19 レスポンシブ・ダークモード

**AC-R01 (モバイル — `/counselors`)**: viewport 375x667 で `/counselors` を開いた際、フィルターパネルが初期状態で隠れており、Button「フィルター」が表示される。Button クリックでフィルターパネルが展開する。
**AC-R02 (モバイル — Booking sidebar)**: viewport 375x667 で `/booking/[id]` を開いた際、サイドバー「予約内容」が下方にスタック表示され、メインフォームと重ならない。
**AC-D01 (ダークモード)**: `<html class="dark">` を注入した状態で主要ページ（`/`, `/counselors`, `/about`）を開いた際、`bg-gray-900` 系の背景や `text-white` 系のテキストに切り替わる箇所が存在する（少なくとも Header / Footer / Card のいずれか）。

### 3.20 予約完了フロー（認証必須）

**AC-B06-Auth (拡張)**: テストユーザー（`test_e2e_user_001@example.com`）でログイン済み状態で `/booking/[id]` を開き、セッション形式・日付・時刻を選択して「予約を確定する」をクリックすると、Success Card（`h1`「予約が完了しました」、Button「ダッシュボードへ」「カウンセラー一覧へ」）が表示される。Supabase が利用不可な環境では本 AC は除外（§5.2 適用）。

---

## 4. データ契約（Type / Schema）

詳細は `src/types/database.ts` および `supabase/migrations/20260419000000_spiritual_features.sql` 参照。主要型の制約:

- `UserRole = 'admin' | 'counselor' | 'client'`
- `CounselorLevel = 'starter' | 'regular' | 'senior' | 'master'`
- `BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'`
- `SessionType = 'online' | 'chat' | 'phone'`
- `AvailabilityMode = 'offline' | 'accepting_bookings' | 'machiuke'`
- `GrowthStage = 'shoshin' | 'shinka' | 'musubi'`
- `WalletTxType = 'topup' | 'session_charge' | 'signup_bonus' | 'referral_bonus' | 'refund'`
- `ReviewAxis = 'insight' | 'empathy' | 'practicality' | 'approachability' | 'awareness'`
- `ColumnCategory = 'founder' | 'seo' | 'counselor' | 'testimonial'`

---

## 5. 評価スコープと除外

### 5.1 E2E 検証対象
- §3 のすべての AC
- 全公開ページの smoke + 主要フォームのインタラクション
- ダッシュボードはモックデータ or fallback を許容

### 5.2 Supabase 未接続時の許容挙動
- `/counselors`, `/counselors/[id]`: mockCounselors で表示が続行すること
- Dashboard 系: 認証必須なので mock では通過できない箇所がある。この場合は `/login` へのリダイレクト確認で合格とする
- Stripe 呼び出し: 失敗時に 500 にならず、ユーザーフレンドリーなエラー表示で fallback すること

### 5.3 本仕様のバージョン管理
- 本ファイル更新は Planner / Change Request のみ
- Evaluator または Evaluator 2 が「仕様不備」を報告した場合、Change Request が §3 を改訂する

### 5.4 改訂履歴
- **2026-04-24 Planner**: 初版作成（コードベース + 既存 e2e tests から 85 AC 抽出）
- **2026-04-25 Change Request (1st)**: AC-A05 を実装の日本語 tier 表記（新人/レギュラー/シニア/マスター + 英語 Level Badge）に修正。AC-C02 の検索 Input placeholder を実装文言（`名前・自己紹介...`）に修正
- **2026-04-25 Change Request (2nd)**: バックログ AC を追加 — §3.18 静的検証・単体テスト (AC-Q01〜04)、§3.19 レスポンシブ・ダークモード (AC-R01, AC-R02, AC-D01)、§3.20 予約完了フロー (AC-B06-Auth 拡張)。総 AC: 92
