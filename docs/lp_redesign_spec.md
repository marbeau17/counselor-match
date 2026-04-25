# ランディングページ デザイン刷新 仕様書

**作成日**: 2026-04-26
**対象**: `/` (Landing) およびそれを構成する `landing_sections` (page_key='home')
**対象 URL**: https://counselors.aicreonext.com
**目的**: AI 量産テンプレ感を排し、カウンセリングサービスとしての温度・安心感・人間味を表現する

---

## 1. 現状の課題分析

### 1.1 「AI 感」を生んでいる要素 (8 項目)

| # | 要素 | 問題 |
|---|---|---|
| **C1** | Lucide アイコン (Heart / Compass / Shield) | SaaS テンプレで頻出、ユーザーは無意識に「テック企業」と認識 |
| **C2** | Emerald 単色ブランド | 単一色 = 機械的。カウンセリングは「揺らぎ」「複雑さ」を許容するパレットが必要 |
| **C3** | 完全シンメトリの 3 列グリッド | 整い過ぎが冷たさを生む。手作業感・有機性が皆無 |
| **C4** | Sans-serif 一辺倒の見出し | 編集的・文学的な深さが欠落 |
| **C5** | 箇条書き多用 | "syllabus 感"。ストーリーや余白がない |
| **C6** | ヒーローに人の顔が無い | カウンセリング = 対話なのに人物が見えない |
| **C7** | 「4 層」「メソッド」「構造」等の専門用語が早い | 初心者を弾く。学術論文の冒頭のような印象 |
| **C8** | Unsplash の風景写真 (calm scene) | きれいだが「誰の物語か」が伝わらない |

### 1.2 良いカウンセリング LP に共通する特徴

- ヒーローに **目を伏せた人物の写真** または **手・後ろ姿** (顔が前面に来すぎない、想像の余地)
- **物語の流れ** (悩み → 出会い → 変化 → 統合) で構成
- **手書き / 線画イラスト** でアクセント
- **Editorial typography** (見出しは serif or 細い weight)
- **Asymmetric layout** で余白の呼吸を作る
- **ナラティブのコピー** ("4 層から…" ではなく "息が浅くなった夜に…")
- **オフホワイト / 温かいベージュ** ベース、emerald はアクセント程度

---

## 2. ターゲットペルソナと感情ジャーニー

### 2.1 主要ペルソナ

**A. 心の疲弊を感じている 30〜40 代女性 (主)**
- きっかけ: 職場ストレス、家族関係、ライフイベント
- 不安: 「カウンセリングは精神疾患の人が行く所では?」「占いと違うの?」
- 求めるもの: **判断されない場所**、**急かされない時間**
- LP に求める情報: 安心できる雰囲気 → どんな人が伴走してくれるか → 仕組み

**B. 自己理解を深めたい 20〜30 代 (副)**
- きっかけ: 内省ブーム、自己啓発、キャリア悩み
- 求めるもの: ツール (タロット / 性格診断) → 本格的な対話

### 2.2 感情ジャーニー (ペルソナ A)

```
[訪問]    →  ふっと息を吐けた感じ        ← Hero の余白と写真
[認知]    →  ここなら判断されないかも       ← ナラティブコピー
[興味]    →  どんな人が話を聞いてくれるの    ← Counselor 写真とプロフィール
[理解]    →  仕組みが分かりやすい          ← How it works
[安心]    →  実際に受けた人の声           ← Testimonials
[一歩]    →  まず無料で診断してみよう       ← Tools or 無料登録
```

**現状の LP は [認知] と [興味] の橋渡しが弱い**。ナラティブとカウンセラーの可視化が不足。

---

## 3. デザインビジョン (3 キーワード)

### V1. 余白 (Ma)
- 行間 1.8、セクション間 120px、Hero は 16:9 を超えない圧迫感
- 1 画面 1 メッセージ、複数情報を詰めない

### V2. 手触り (Tactility)
- 編集的な serif 見出し (Noto Serif JP)
- 罫線・装飾線は手描き感のある SVG
- Card には微細な texture / 影 (1px の温かい emerald-100/30 影)

### V3. 物語 (Narrative)
- 「4 層から…」「Soul Mirror Law」等の用語は **後半** に追いやる
- 冒頭は **共感的な問い** で始める (例: "誰にも言えなかったことが、息のように溜まっていませんか")

---

## 4. ビジュアル方針

### 4.1 カラーパレット

| トークン | 値 | 用途 |
|---|---|---|
| `bg-base` | `#FAF7F2` (warm off-white) | 全体背景 |
| `bg-card` | `#FFFFFF` | カード |
| `text-primary` | `#2A2A2A` (warm black) | 本文 |
| `text-secondary` | `#5C5854` (warm gray) | サブテキスト |
| `accent-primary` | `#7C5E3C` (deep beige) | 見出しアクセント / link |
| `accent-secondary` | `#A8B5A0` (sage green) | Badge / hover |
| `accent-warm` | `#D4A574` (terracotta light) | CTA Btn |
| `accent-quiet` | `#E8DDD0` (cream) | divider / soft bg |
| `dark-bg` | `#1A1714` (warm black) | dark mode 背景 |
| `dark-card` | `#252220` | dark mode card |

**従来の `emerald-600` は補助カラーに格下げ** (タグ / 状態 Badge のみ)。

### 4.2 タイポグラフィ

| 用途 | フォント | サイズ / weight |
|---|---|---|
| 見出し H1 | Noto Serif JP | 36-56px / 500 |
| 見出し H2-H3 | Noto Serif JP | 24-32px / 500 |
| 本文 | Noto Sans JP | 15-17px / 400, line-height 1.8 |
| キャプション | Noto Sans JP | 13px / 400, opacity 0.7 |
| アクセント (英文) | Cormorant Garamond | 18-24px italic |

### 4.3 画像方針

| カテゴリ | 旧 | 新 |
|---|---|---|
| ヒーロー | 風景 (霧の朝) | **窓辺で本を読む人 / 手で湯気を包む / 後ろ姿で海を見る** (主体は人、顔は伏せ気味) |
| Features | 抽象風景 | **手のクローズアップ / 紙とペン / カップとお茶** (具体的な日常) |
| ステップ | 風景 4 枚 | **イラスト or 線画 4 種** (検索 → ノート → 椅子 → 万年筆) |
| ツール | 風景 | **本物のタロットカードや手描きノート** |
| 証言 | 顔写真 | **後ろ姿 or イニシャルバッジ** (個人情報配慮) |
| Gallery | 風景 8 枚 | **静物 + ディテール** (光の差すカーテン / 木目のテーブル / 一輪の花) |
| CTA | 夜景 | **朝の窓辺 / 手紙を開く瞬間** |

### 4.4 レイアウト方針

- **Hero**: 左に大きな serif 見出し + 控えめな CTA、右に縦長人物写真 (60:40)
- **Story** (新規): 1 段組の長文ナラティブ、行幅 65ch、editorial 感
- **Approach** (旧 features): 横スクロール風の 3 カード、各カードに **段落タイトル + 本文 + 小さな手書きアイコン**
- **Counselor 紹介**: 顔写真 + 引用 + 5 軸の小グラフ、カードでなく blog post 風
- **Voice** (旧 testimonials): 縦並び、引用符 (大きな ` `` `)、手書き署名感
- **Quiet Tools**: タイトル小さめ、画像中心、3 カード
- **Closing**: 柔らかい "始めてみる" CTA、夜の窓辺イメージ

---

## 5. セクション構成 (新)

| 旧 順序 | 新 順序 | section_type | 変更内容 |
|---|---|---|---|
| 1. hero | 1. **hero (人物 + serif)** | hero | 写真差し替え、コピー刷新、レイアウト分割 |
| 2. trust_bar | (削除) | — | "厳選審査済み" 等は別セクションへ統合 |
| 3. features | 4. **approach (改題)** | features | 「私たちのアプローチ」→「3 つの大切にしていること」 |
| 4. gallery | 6. quiet (改題) | gallery | 「日々の余白」へ改題、画像も静物に |
| 5. how_it_works | 5. **journey** | how_it_works | step イラストに、本文ナラティブ化 |
| 6. tools_promo | 7. **invitation** | tools_promo | 「まずは静かに、自分と話してみる」 |
| 7. counselor_showcase | 3. **companions** | counselor_showcase | 「あなたを伴走する人たち」blog post 風 |
| 8. testimonials | 8. **voice** | testimonials | 縦長引用、後ろ姿 / イニシャル |
| 9. column_promo | 9. column_promo | column_promo | (微調整のみ) |
| 10. cta_banner | 10. **closing** | cta_banner | "始めてみる" 控えめ CTA |
| (新規) | 2. **story** | story (新セクション) | 共感の問いから始まる長文ナラティブ |

**新セクション「story」が最重要**。Hero の直後に置き、認知 → 興味の橋渡し。

### 5.1 各セクションのコピー方針 (例)

#### Hero (新)

> **「整える」ではなく、「ほどく」時間を。**
>
> ホリスティック心理学に根ざした、伴走型のカウンセリング。

CTA: `静かに話せる人を探す` (旧: あなたに合う伴走者を探す)

#### Story (新規セクション)

> 急かされない場所で、誰かに、ゆっくり聞いてほしい。
>
> 何かを変えるためでなく、ただ自分の輪郭を確かめるために。
>
> カウンセリングは、特別なことが起きた人のものではありません。日々の中で少しずつ硬くなる呼吸を、もう一度ほどく時間です。
>
> 私たちは、判断ではなく対話を、技法ではなく関係性を、ゴールではなく道のりを大切にする伴走者を集めています。

#### Approach (旧 features 改題)

旧: 「私たちのアプローチ」 → 新: **「3 つの、大切にしていること」**

- (1) **聴くこと** 〜 解決を急がずに、まず理解する
- (2) **映すこと** 〜 関係性を鏡として、自分の内側に出会う
- (3) **守ること** 〜 守秘・誠実さ・専門性で対話の場を支える

(※ 旧コピーの "ホリスティック心理学" "Soul Mirror Law" は about ページに退避)

---

## 6. マイクロコピー方針

| 場所 | 旧 | 新 |
|---|---|---|
| 「カウンセラーを探す」CTA | `あなたに合う伴走者を探す` | `静かに話せる人を探す` |
| 無料登録 CTA | `無料で始める` | `まず登録して見てみる` |
| Footer | "© 2026 合同会社AICREO NEXT. All rights reserved." | (変更なし、ただし運営の一言を追加) |
| empty state | `条件に合うカウンセラーが見つかりませんでした` | `条件を少し広げてみてください` |

**禁止語**: ソリューション / オプティマイズ / シナジー / プラットフォーム / メソドロジー (技術カタログ感)

---

## 7. 技術的検討事項

### 7.1 フォント追加

`src/app/layout.tsx` に Noto Serif JP + Cormorant Garamond を追加:

```tsx
import { Noto_Serif_JP, Cormorant_Garamond } from "next/font/google"

const serif = Noto_Serif_JP({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-serif" })
const accent = Cormorant_Garamond({ subsets: ["latin"], weight: ["400","500"], style: ["italic"], variable: "--font-accent" })
```

`tailwind.config` (or `globals.css` `@theme`):

```css
@theme {
  --font-serif: var(--font-serif);
  --font-accent: var(--font-accent);
}
```

### 7.2 カラートークン

`globals.css` に新規 CSS variables を追加 (Tailwind v4 `@theme`):

```css
@theme {
  --color-bg-base: #FAF7F2;
  --color-accent-primary: #7C5E3C;
  --color-accent-secondary: #A8B5A0;
  --color-accent-warm: #D4A574;
  --color-accent-quiet: #E8DDD0;
}
```

### 7.3 セクションコンポーネント

新規:
- `StoryNarrativeSection` (1 段組 long form text)
- `HeroSplitSection` (左テキスト / 右人物写真の split layout)

既存改修:
- `FeaturesSection` → ナンバリング + 縦線アクセント追加
- `HowItWorksSection` → イラストモード対応 (image_url + caption)
- `CounselorShowcaseSection` → blog post 風レイアウト
- `TestimonialsSection` → 縦長引用カード

### 7.4 画像差し替え戦略

**フェーズ 1 (本仕様書範囲)**:
- Unsplash の curated 画像で統一感ある世界観を構築
- `lib/landing.ts` の DEFAULT_HOME_SECTIONS と migration `20260426000002_landing_redesign.sql` を新規追加

**フェーズ 2 (将来)**:
- Gemini Banana Pro で独自イラスト・ヒーロー写真を生成
- `/dashboard/admin/images` から CMS 管理に移行

### 7.5 アニメーション

- スクロール時の fade-in (`opacity 0 → 1, translate-y 8px → 0`, 500ms)
- Hero 写真の subtle ken-burns (4% scale, 8s ease)
- 過剰な parallax は避ける (重いため)

---

## 8. 実装フェーズ計画

| フェーズ | 内容 | 工数感 |
|---|---|---|
| **F1** | フォント + カラートークン追加 (`layout.tsx`, `globals.css`) | 小 (15 分) |
| **F2** | セクションコンポーネント刷新 (`sections.tsx`) - 7 種類 | 中 (60-90 分) |
| **F3** | コピー / 画像 URL 一新 (DEFAULT_HOME_SECTIONS + migration) | 中 (45 分) |
| **F4** | 視覚回帰 baseline 更新 + 既存 e2e の修正 (見出し変更等) | 小〜中 (30 分) |
| **F5** | 全 e2e + 本番 e2e 実行 + 修正 | 中 (30-60 分) |
| **F6** | 本番 Supabase migration 適用 + ビルド & デプロイ確認 | 小 (15 分) |

**合計**: 3〜4 時間

---

## 9. 受け入れ基準 (Playwright 検証可能)

実装後、以下が満たされることを Playwright で検証:

**AC-LR01**: Hero 見出しに「ほどく」または「整える」が含まれる
**AC-LR02**: Story セクションが Hero の直後に存在し、`<p>` が 65ch 程度の長文を含む
**AC-LR03**: Approach セクションの見出しが「3 つの、大切にしていること」を含む
**AC-LR04**: ステップ (journey) のイラスト or 写真が 4 つ表示される
**AC-LR05**: Counselor showcase が blog post 風 (顔写真 + 引用) のレイアウトで表示される
**AC-LR06**: Testimonials が縦長カード or 引用符付きで表示される
**AC-LR07**: フォント読み込み確認 (`document.fonts.check("16px Noto Serif JP")` が true)
**AC-LR08**: カラートークン適用確認 (`<body>` の background が `#FAF7F2` に近い)
**AC-LR09**: a11y 違反 (critical) ゼロ
**AC-LR10**: Lighthouse Performance ≥ 0.7 / Accessibility ≥ 0.85 (本番ビルド)
**AC-LR11**: 「ホリスティック心理学」「Soul Mirror Law」等の旧専門用語が hero / story では使われていない
**AC-LR12**: CTA Btn コピーが「静かに話せる人を探す」など新しい温度感

---

## 10. リスクと考慮事項

| リスク | 対策 |
|---|---|
| 視覚回帰テスト全敗 | baseline 全 6 枚を新ビジュアルで regenerate |
| 既存 e2e (landing.spec.ts 等) の文言期待値が壊れる | spec ファイルも合わせて更新 |
| AC-L01 (旧仕様) との乖離 | optimized_spec.md AC-L01 / L02 を Change Request で改訂 |
| フォント読み込みで CLS 悪化 | next/font の subsets 限定 + display=swap で軽減 |
| 本番 Supabase migration UPDATE がロールバック困難 | 適用前にバックアップ必須 (前回同様 `/tmp/landing_backup_*.json`) |

---

## 11. 承認確認項目

実装着手前に以下を確認したい:

1. **デザインビジョン 3 キーワード**「余白 / 手触り / 物語」は方向性として OK か?
2. **カラーパレット** (warm off-white + 大地系のアクセント) で進めて良いか?
3. **「story」セクション新設** + ヒーロー直後に配置で良いか?
4. **「ホリスティック心理学」「Soul Mirror Law」を hero/story から後退** させて about ページに集約することに同意するか?
5. **Cormorant Garamond + Noto Serif JP** のフォント追加 OK か? (バンドル ~80KB 増)
6. **ヒーローに人物写真** を入れることに同意するか? (Unsplash 利用 → 将来的に Gemini 生成へ移行)

---

**Status**: 仕様確定待ち
**次工程**: 上記 6 項目の合意 → F1〜F6 を順次実装 → 試験 → ビルド & デプロイ
