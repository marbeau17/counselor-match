```markdown
# プロジェクトルール

このプロジェクトは、既存の実装と仕様書から最適化された仕様を定義し、検証・修正・仕様更新を自律的に回す5つのサブエージェント（Planner → Evaluator → Generator(Fixer) → Evaluator 2 → Change Request）によるクローズドループ・パイプラインで構築される。

## エージェント構成とクローズドループ

```text
[既存コード/旧仕様書]
       ↓
    Planner ──────────────────────────────┐
 (最適化仕様作成)                             │
       ↓                                  │
   Evaluator ────────(仕様の不備/矛盾)──→ Change Request
 (Playwright検証)                         ↑ (仕様書更新)
       │                                  │
   (バグ検知)                               │
       ↓                                  │
 Generator(Fixer)                         │
   (コード修正)                             │
       ↓                                  │
  Evaluator 2 ───────(仕様の不備/矛盾)────┘
   (修正再評価)
       │
   (不合格/バグ残存) ──→ Generator(Fixer) へ戻る
       │
     (合格)
       ↓
     完了
```

## ファイル規約

| パス | 用途 | 書き込み権限 |
|------|------|-------------|
| `/docs/optimized_spec.md` | 最適化された最新仕様書 | Planner, Change Request |
| `/docs/progress.md` | 実装・修正進捗 | Generator(Fixer) |
| `/docs/feedback/eval_report.md` | 評価・テスト結果 | Evaluator, Evaluator 2 |

- **仕様書は Planner および Change Request だけが更新する。** Generator・Evaluator は読み取り専用。
- **実装進捗は Generator(Fixer) だけが書く。**
- **フィードバックは Evaluator / Evaluator 2 だけが書く。**

## ワークフロー

### Step 1: 仕様最適化（Planner）
- 既存の仕様書（※指定されたパス）および現在の実装（コードベース）を読み込み、現状に即した最適化された最新の仕様書 `/docs/optimized_spec.md` を作成する。
- 曖昧な表現を排除し、Evaluator が Playwright で検証可能な具体的な「受け入れ基準（UI要素、期待される動作、状態遷移など）」を必ず記述する。

### Step 2: 初期検証（Evaluator）
- `/docs/optimized_spec.md` の受け入れ基準を読み込む。
- **MCP Playwright** を使用してアプリケーションを実際に操作し、仕様通りに動作するかテストを実行する。
- 結果を `/docs/feedback/eval_report.md` に出力し、以下の判定を行う。
  - **【合格】**: クローズドループ完了。
  - **【実装バグ検知】**: 仕様は正しいが実装が伴っていない場合 → **Step 3 (Generator)** へ。
  - **【仕様不備検知】**: 実装上不可能、矛盾がある、または仕様自体が間違っている場合 → **Step 5 (Change Request)** へ。

### Step 3: バグ修正（Generator / Fixer）
- `/docs/feedback/eval_report.md` で指摘された実装上のバグを確認する。
- `/docs/optimized_spec.md` に準拠するようにコードを修正する。**仕様書自体の変更は行わない。**
- 修正完了後、`/docs/progress.md` に修正内容とローカルでの起動手順・確認事項を記録する。

### Step 4: 再検証（Evaluator 2）
- Generator による修正完了後、再度 **MCP Playwright** を用いて修正箇所および全体のリグレッション（デグレ）テストを実行する。
- 結果を再度判定する。
  - **【合格】**: クローズドループ完了。
  - **【バグ残存・回帰】**: 再度 **Step 3 (Generator)** へ差し戻し。
  - **【修正中の仕様不備発覚】**: **Step 5 (Change Request)** へ。

### Step 5: 仕様書更新（Change Request）
- Evaluator または Evaluator 2 から「仕様の矛盾・間違い・実現不可能性」が報告された場合のみ発火する。
- 報告された問題を分析し、`/docs/optimized_spec.md` を正しい仕様に書き換える。
- 更新完了後、新たな仕様に基づいてテストを行うため **Step 2 (Evaluator)** へループを戻す。

## 評価基準と閾値（Evaluator / Evaluator 2）

| 基準 | 閾値 | アクション |
|------|------|---------------|
| 機能完全性 | 4/5 以上 | 未達なら Generator へ差し戻し |
| 動作安定性 | 4/5 以上 | 未達なら Generator へ差し戻し |
| 仕様の妥当性 | 5/5 必須 | 1つでも矛盾があれば Change Request へ |
| 回帰(デグレ)なし| 5/5 必須 | 未達なら Generator へ差し戻し |

## 絶対ルール

1. **責務を越境しない** - Evaluator はコードを直さない。Generator は仕様を変えない（仕様がおかしいと思っても勝手に直さず、Evaluator に仕様不備の判定を委ねる）。
2. **自動テストの徹底** - 評価は必ず MCP Playwright を介した実際のブラウザ操作（E2Eテスト）で行う。推測での評価は禁止。
3. **無限ループの防止** - 同じバグまたは仕様変更で3回以上ループが発生した場合は、プロセスを一時停止し、ユーザーに介入を求める。
4. **起動手順の明記** - アプリの起動手順は常に最新の状態を保ち、Evaluator が Playwright を実行する前のセットアップで迷わないようにする。
```