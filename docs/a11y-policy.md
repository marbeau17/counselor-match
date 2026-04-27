# アクセシビリティポリシー (a11y Policy)

本ドキュメントは `counselor-match` プロジェクトにおけるアクセシビリティ (a11y) の方針、コーディング規約、検証手順、CI ゲートを定義する。すべての開発者・レビュアーは本ポリシーに従うこと。

---

## 1. ポリシー宣言

- 本プロジェクトは **WCAG 2.1 Level AA 準拠** を目標とする。
- UI 設計および実装の指針として、**Vercel Web Interface Guidelines** を全面採用する。
- アクセシビリティは「後付け」ではなく、設計・実装・レビューの全フェーズに組み込む。
- ユーザーがどのようなデバイス・支援技術 (スクリーンリーダー、キーボードのみ、音声入力など) を用いても、主要な機能を利用できることを保証する。

---

## 2. 対象範囲

### 2.1 AA 必須 (Public ページ)

以下のページは **WCAG 2.1 AA 必須** とし、自動 / 手動検証の両方で品質を担保する。

- `/` (ランディングページ)
- `/counselors` (カウンセラー一覧)
- `/about` (サービス紹介)
- `/column` (コラム / 記事)
- `/tools/*` (診断ツール等)
- `/login` (ログイン)
- `/register` (新規登録)

### 2.2 Best-effort (認証必須ページ)

以下は best-effort 対応とする。AA を目標としつつも、認証後の管理 UI 等で例外的な実装が必要な場合は理由を PR に明記する。

- `/dashboard/*` (利用者・カウンセラー・管理ダッシュボード)

---

## 3. コーディング規約

### 3.1 セマンティクス・ARIA

- **icon-only button** には必ず `aria-label` を付与する。
  - 例: `<button aria-label="メニューを開く"><MenuIcon /></button>`
- **装飾画像** は `alt=""` かつ `aria-hidden="true"` を指定し、スクリーンリーダーに読まれないようにする。
- **意味のある画像** には文脈に即した `alt` を必ず指定する。
- `<button>` は **アクション** に、`<Link>` (Next.js) は **ナビゲーション** に使用する。混同しないこと。
- **見出し階層** (h1 → h2 → h3 ...) のスキップを禁止する。デザイン上のサイズ調整は CSS で行う。
- すべての **form control** (`input`, `select`, `textarea`) には対応する `<label>` または `aria-label` / `aria-labelledby` を付与する。

### 3.2 フォーカス管理

- `outline-none` の **単独使用を禁止** する。必ず `:focus-visible` の代替スタイル (リング・枠線等) を併設する。
  - 推奨: `focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500`
- モーダル等は **focus trap** を実装し、閉じた際は呼び出し元へフォーカスを戻す。
- カスタムインタラクティブ要素にも `tabindex="0"` とキーボードイベントハンドラを付与する。

### 3.3 色とコントラスト

- 通常テキストは **コントラスト比 4.5:1 以上**、大型テキストは **3:1 以上** を確保する。
- 色のみで情報を伝えない (アイコン・テキスト・パターンを併用)。

---

## 4. 検証ツール

### 4.1 自動検証

| ツール | スコープ | 配置 |
| --- | --- | --- |
| `@axe-core/playwright` | E2E ページ単位の WCAG ルール検査 | `e2e/a11y.spec.ts` |
| Lighthouse CI | a11y スコア (公式 audits) | `lighthouserc.json` (a11y ≥ 0.85) |
| ESLint (`eslint-plugin-jsx-a11y`) | コード静的解析 | `eslint.config.mjs` |

### 4.2 手動検証

- **半年に 1 回**、Vercel Web Interface Guidelines に基づき手動監査を実施する。
- 主要なフロー (新規登録 → カウンセラー検索 → 予約) をキーボードのみで操作可能か確認する。
- VoiceOver (macOS) / NVDA (Windows) で読み上げを確認する。

---

## 5. CI ゲート

`.github/workflows/ci.yml` で以下のゲートを設定する。

- `@axe-core/playwright` の `critical` / `serious` 違反は **マージブロック** とする。
- `moderate` / `minor` 違反は warning として記録する (ブロックしない)。
- **color-contrast** ルールのうち、ブランドカラー (`brand-500` 等) に起因する制約違反は **warn 扱い** とし、デザインチームと協議の上で例外を許可する。
- Lighthouse CI で a11y スコアが **0.85 未満** になった場合は CI を失敗させる。

---

## 6. 実装済み a11y 機能

以下は本プロジェクトに既に組み込まれている a11y 関連機能である。新規実装時もこれらを活用・継続すること。

- **Reduced motion 対応**
  - `@media (prefers-reduced-motion: reduce)` でアニメーション・トランジションを最小化。
  - Framer Motion 等を使う場合は `useReducedMotion()` を参照する。
- **Dark mode 対応**
  - Tailwind CSS の `dark:` クラスでライト / ダークモードを完全サポート。
  - システム設定 (`prefers-color-scheme`) と連動。
- **Skip link**
  - ページ最上部に `<a href="#main">メインコンテンツへスキップ</a>` を配置し、Tab キーで最初にフォーカス可能。
- **言語属性**: `<html lang="ja">` を必ず指定。
- **viewport meta**: ピンチズームを禁止しない (`maximum-scale=1` 等を指定しない)。

---

## 7. 責任とレビュー

- **PR 作成者** は本ポリシーに従い実装し、PR 説明欄の a11y チェックリストを記入する。
- **PR レビュアー** は以下のチェックリストを必ず確認する。
  - [ ] icon-only button に `aria-label` がある
  - [ ] 装飾画像に `alt=""` + `aria-hidden="true"` がある
  - [ ] `outline-none` 単独使用がない
  - [ ] form control に label がある
  - [ ] 見出し階層がスキップされていない
  - [ ] キーボード操作で全機能にアクセス可能
  - [ ] axe-core テストがパスしている
- 違反が見つかった場合は **修正をリクエスト** し、CI を再実行する。

---

## 8. 連絡先・報告

- a11y バグや改善提案は **GitHub Issues** に `a11y` ラベルを付与して報告する。
  - リポジトリ: `counselor-match`
  - テンプレート: `.github/ISSUE_TEMPLATE/a11y_bug.md` (用意予定)
- 緊急度の高い (重大な情報アクセス障害) ものは `priority:high` ラベルも付与する。
- セキュリティ関連と関連する場合は private security advisory を併用する。

---

## 9. 改訂履歴

| 日付 | 内容 | 担当 |
| --- | --- | --- |
| 2026-04-25 | 初版作成 | a11y チーム |

---

本ポリシーは継続的に見直す。WCAG の改訂、Vercel Web Interface Guidelines の更新、利用者からのフィードバックを受けて、半年に一度を目安に改訂する。
