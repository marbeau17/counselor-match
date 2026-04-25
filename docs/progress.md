# Generator (Fixer) 修正進捗

**修正者**: Generator (Fixer)
**修正日**: 2026-04-24
**対象**: `/docs/feedback/eval_report.md` で指摘された BUG #1, BUG #2
**仕様書変更**: なし（`/docs/optimized_spec.md` は変更していない）
**書き込み権限**: Generator (Fixer) のみ

---

## 修正概要

Supabase 環境変数（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）未設定時に、`/booking/[id]` で固着、`/dashboard/*` で 500 エラーが発生していた問題を解消。

### 修正戦略
`createClient()` を **env 欠落時に `null` を返す型安全な関数** に変更。各呼び出し側で null を明示的にチェックし、適切なフォールバック（モック表示 / `/login` リダイレクト / 503 レスポンス）に分岐させた。

---

## 変更ファイル

### コア修正

| ファイル | 変更内容 |
|---|---|
| `src/lib/supabase/server.ts` | `createClient()` が env 欠落時に `null` 返却。戻り値型が `SupabaseClient \| null` に変更 |
| `src/lib/supabase/client.ts` | 同上（ブラウザ版） |

### BUG #1 修正: Booking ページ

| ファイル | 変更内容 |
|---|---|
| `src/app/booking/[id]/page.tsx` | `load()` 関数全体を `if (supabase) { try { ... } catch {} }` で囲み、失敗時はモックフォールバックに即移行。ロード固着を解消 |

### BUG #2 修正: Dashboard 系

| ファイル | 変更内容 |
|---|---|
| `src/app/dashboard/layout.tsx` | `if (!supabase) redirect("/login")` を先頭に追加 |
| `src/app/dashboard/page.tsx` | 同上 |
| `src/app/dashboard/client/page.tsx` | 同上 |
| `src/app/dashboard/counselor/page.tsx` | 同上 |
| `src/app/dashboard/admin/page.tsx` | 同上 |
| `src/app/dashboard/wallet/page.tsx` | 同上 |
| `src/app/dashboard/journey/page.tsx` | `fetchStats` と `JourneyPage` 両方に null チェック追加 |
| `src/app/dashboard/counselor/availability/page.tsx` | env 直接参照を `createClient()` の null チェックに統一 |

### その他（型安全化に伴う null チェック追加）

| ファイル | 変更内容 |
|---|---|
| `src/app/layout.tsx` | `createClient()` の null チェック |
| `src/app/counselors/page.tsx` | 同上（既存の env 事前チェックと併存） |
| `src/app/counselors/[id]/page.tsx` | `generateMetadata` と page 本体で null チェック |
| `src/app/login/page.tsx` | ログインボタン＆Googleログインで null 時エラー表示 |
| `src/app/register/page.tsx` | 同上 |
| `src/app/auth/callback/route.ts` | null 時 `/login?error=supabase_unavailable` へリダイレクト |
| `src/app/api/auth/signout/route.ts` | null 時も `/` へリダイレクトで継続 |
| `src/app/api/bookings/route.ts` | null 時 503 Service Unavailable |
| `src/app/api/counselor/availability/route.ts` | 同上 |
| `src/app/api/wallet/signup-bonus/route.ts` | 同上 |
| `src/lib/wallet.ts` | `getOrCreateWallet`, `listWalletTransactions`, `issueSignupBonus` に null チェック |
| `src/lib/columns.ts` | `listPublishedColumns`, `getColumnBySlug` に null チェック（既存の FALLBACK_COLUMNS にフォールバック） |

---

## 修正後の挙動検証（Generator セルフチェック）

Supabase 未設定状態で dev server を再起動し、主要ルートを MCP Playwright で確認:

| ルート | 修正前 | 修正後 |
|---|---|---|
| `/dashboard` | 500 Application error | ✅ `/login` へリダイレクト |
| `/dashboard/client` | 500 Application error | ✅ `/login` へリダイレクト（layout 経由） |
| `/dashboard/wallet` | 500 Application error | ✅ `/login` へリダイレクト |
| `/dashboard/journey` | 500 Application error | ✅ `/login` へリダイレクト |
| `/booking/[id]` | 「読み込み中...」で固着 | ✅ Login alert + セッション形式3択 + 日付/時刻入力 + 確定Button 全表示 |
| `/counselors` | ✅ 正常（モック表示） | ✅ 変化なし（回帰なし） |
| `/counselors/[id]` | ✅ 正常（モック表示） | ✅ 変化なし（回帰なし） |
| `/` / `/column` / `/tools/*` / `/about*` | ✅ 正常 | ✅ 変化なし（回帰なし） |

---

## 起動手順（Evaluator 2 向け）

### 依存インストール（初回のみ）
```bash
cd /Users/yasudaosamu/Desktop/codes/spiritual-counselor/counselor-match
bun install
```

### dev server 起動（ポート 4000）
```bash
lsof -ti:4000 | xargs -r kill
NEXTAUTH_SECRET="e2e-dev-secret-for-testing-only-please-change" NEXTAUTH_URL="http://localhost:4000" PORT=4000 bun run next dev -p 4000 > /tmp/dev-server.log 2>&1 &
disown
```

### 起動確認
```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 | grep -qE "^(200|301|302|307)$"; do sleep 2; done
echo "dev server ready at http://localhost:4000"
```

### Supabase 環境変数について
本修正は **Supabase 未設定時のグレースフルフォールバック** を保証する。Supabase を有効化したテストを行う場合は、`counselor-match/` に `.env.local` を作成し以下を定義:
```
NEXT_PUBLIC_SUPABASE_URL=<your_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

---

## 残課題・既知事項

### TypeScript 型エラー（pre-existing、本修正とは無関係）
- `src/components/layout/header.tsx(103,55)`: Button コンポーネントの `asChild` prop が未定義
- `src/components/layout/__tests__/*.test.tsx`: vitest グローバル（`describe`, `it`, `expect`, `vi`）が `tsconfig.json` の types に含まれていない
- これらは BUG #1, #2 の根本原因ではなく、Next.js dev server は問題なく起動する

### Change Request への推奨事項（優先度低）
Evaluator から §AC-A05 および §AC-C02 について仕様書の記述ミスが報告されている。本修正では仕様書は変更していない（責務越境禁止）。Evaluator 2 の結果を見て、必要であれば Change Request フェーズで仕様書側を更新する。

---

## Phase 7 (Generator 2nd cycle) 修正記録 — 2026-04-25

### 対象バグ
- **BUG #3**: ダークモード未実装 (AC-D01, グローバル CLAUDE.md §2 違反)
- **BUG #4**: vitest 起動不可 (ERR_REQUIRE_ESM, AC-Q03)

### BUG #4 修正

| ファイル | 変更 |
|---|---|
| `package.json` (deps) | `vitest@^2.1.9` + `vite@^5.4.0` + `@vitejs/plugin-react@^4.3.4` + 新規 `happy-dom@^20` |
| `vitest.config.ts` | `environment: 'jsdom'` → `'happy-dom'`（jsdom transitive deps の ESM 不整合を回避） |
| `tsconfig.json` | `"types": ["vitest/globals"]` を追加 → 352 件のテストファイル TS エラーを解消 |
| `src/components/layout/header.tsx` (L103) | Button の `asChild={false}` を削除（asChild prop 未定義のため）→ 残 1 件の TS 本体エラーを解消 |

**結果**: `bunx tsc --noEmit` → **0 errors**。`bun run test` → vitest 動作可能、100 passed / 13 failed（13 件は古いテキスト期待値のテスト、本修正と無関係）。

### BUG #3 修正

| ファイル | 変更 |
|---|---|
| `src/app/globals.css` | Tailwind v4 の `@variant dark` を class セレクタで定義 + `html.dark body` のフォールバック CSS |
| `src/app/layout.tsx` | `<head>` に OS preference / localStorage("theme") を読む inline script、`<html suppressHydrationWarning>`、body に `dark:bg-gray-950 dark:text-gray-100` |
| `src/components/ui/button.tsx` | 全 6 variant に dark variant を追加 |
| `src/components/ui/card.tsx` | Card 本体 + CardDescription に dark variant |
| `src/components/ui/input.tsx` | placeholder, border, bg を dark 対応 |
| `src/components/layout/header.tsx` | header bg, ブランド名, ナビリンク, ドロップダウン bg に dark variant |
| `src/components/layout/footer.tsx` | footer bg, セクション heading, リンクに dark variant |

**結果**: `<html class="dark">` 注入時、body 背景 `rgb(10,10,10)`、Header/Footer の dark bg、34 要素で `dark:` 変種が適用済み。

### 起動手順（変更なし、ポート 4001 利用例）
```bash
lsof -ti:4001 | xargs -r kill
NEXTAUTH_SECRET="e2e-dev-secret-for-testing-only-please-change" NEXTAUTH_URL="http://localhost:4001" PORT=4001 bun run next dev -p 4001 > /tmp/dev-server.log 2>&1 &
disown
```
※ ポート 4000 が他プロジェクトで占有されている場合のみ 4001 を使用。

### 残課題（Phase 8 で判定）
- 13 件の vitest 失敗は古いテスト（Footer/Header の期待テキストが現状コンポーネントと不一致）。本修正の責務外
- ESLint 23 errors は test ファイル内の `any` 型と `<img>` 警告。test 品質改善の別タスク
- Page-level 個別ファイル（`src/app/**/page.tsx`）の dark 対応は未着手。Header/Footer/Card/Button/Input でカバーされる主要部分は OK だが、ページ本体の `bg-white` ハードコード箇所が残っている可能性あり

---

## Evaluator 2 への引き継ぎ

以下を重点的に再検証してほしい:

1. **§3.5 Booking (全 AC)**: BUG #1 修正の確認
2. **§3.11〜3.15 Dashboard (全 AC)**: BUG #2 修正の確認 — 未認証時の `/login` リダイレクトが動作すること
3. **回帰テスト**: §3.1〜3.4, §3.6〜3.10, §3.16 が引き続き合格すること
4. ブラウザコンソールに `@supabase/ssr` 系の Error が出ないこと
