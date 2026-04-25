import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  FileSignature,
  Video,
  MessagesSquare,
  Award,
  UserCheck,
  Grid3x3,
  AlertTriangle,
  Layers,
  ArrowRight,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "カウンセラー選考・レベル基準 | カウンセラーマッチ",
  description:
    "カウンセラーマッチが公開する、カウンセラー選考プロセスと4段階レベル昇格の具体的な数値基準。『厳選』という曖昧な言葉の実態を、すべて開示します。",
}

const SCREENING_STEPS = [
  {
    icon: FileSignature,
    title: "倫理ステートメントの署名",
    desc: "医療的主張・恐怖訴求・恋愛操作など、利用者の脆弱性につけ込む行為を明確に禁ずる誓約書に署名いただきます。",
  },
  {
    icon: Video,
    title: "30分の録画ビデオ面接",
    desc: "動機、経歴、クライアントとの境界設定に対する姿勢を録画形式で確認。第三者評価者が二重にレビューします。",
  },
  {
    icon: MessagesSquare,
    title: "オーディションセッション",
    desc: "訓練を受けた評価者と実際の対話セッションを実施。共感性・構造化・安全性の3軸ルーブリックで採点します。",
  },
  {
    icon: Award,
    title: "実務6ヶ月以上のプラクティス証明",
    desc: "対人支援における6ヶ月以上の実務経験を、書類または第三者の推薦状にて証明していただきます。",
  },
  {
    icon: UserCheck,
    title: "専門家1名のリファレンス確認",
    desc: "当該分野の専門家1名以上から直接リファレンスを取得。形式的な推薦ではなく実質的な聞き取りを行います。",
  },
  {
    icon: Grid3x3,
    title: "Personality Matrix 32 自己評価",
    desc: "32タイプ × 32パターンの自己評価を提出。評価者による整合性確認を経て、マッチング精度の基礎とします。",
  },
]

const TIERS = [
  {
    slug: "starter",
    label: "新人",
    criteria: [
      "選考6ゲート通過直後",
      "0–50セッション実績",
      "メンターによる初期モニタリング対象",
    ],
    ring: "ring-emerald-200",
    badge: "bg-emerald-50 text-emerald-700",
  },
  {
    slug: "regular",
    label: "レギュラー",
    criteria: [
      "50+ セッション完了",
      "平均評価 4.3 以上",
      "直近90日間 倫理違反ゼロ",
      "賠償責任保険への加入",
    ],
    ring: "ring-emerald-300",
    badge: "bg-emerald-100 text-emerald-800",
  },
  {
    slug: "senior",
    label: "シニア",
    criteria: [
      "200+ セッション完了",
      "平均評価 4.5 以上",
      "ピアレビュー合格",
      "賠償責任保険への加入",
    ],
    ring: "ring-emerald-400",
    badge: "bg-emerald-200 text-emerald-900",
  },
  {
    slug: "master",
    label: "マスター",
    criteria: [
      "500+ セッション完了",
      "平均評価 4.7 以上",
      "倫理監査合格",
      "新人・レギュラーへのメンター役割",
    ],
    ring: "ring-emerald-500",
    badge: "bg-emerald-300 text-emerald-900",
  },
]

const SAFEGUARDS = [
  {
    title: "ワンタップ通報機能",
    desc: "セッション中・セッション後いつでも通報可能。受理後48時間以内に初動トリアージを実施します。",
  },
  {
    title: "2件以上の未解決通報で自動停止",
    desc: "未解決の通報が2件蓄積した時点で、当該カウンセラーのアカウントを自動的に一時停止します。",
  },
  {
    title: "賠償責任保険の加入義務",
    desc: "レギュラー以上のレベルでは、対人支援者向け賠償責任保険への加入を継続要件とします。",
  },
]

export default function ScreeningPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-5">
          <ShieldCheck className="h-4 w-4" />
          透明性ポリシー
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          カウンセラー選考・レベル基準
        </h1>
        <p className="text-lg text-emerald-700 font-medium mb-6">
          「厳選」の実態を、数字で公開します。
        </p>
        <p className="text-base text-gray-600 leading-relaxed">
          スピリチュアルカウンセリングは、人生の脆弱な瞬間に寄り添う仕事です。だからこそ「厳選しました」という曖昧な言葉ではなく、
          どのゲートを通過した人が、どの実績を積むと、次のレベルに上がるのか——その基準を具体的な数字で開示します。
          これはクライアントの皆さまに選択の根拠を提供し、同時にカウンセラーに明快な成長経路を示すための私たちの約束です。
          この透明性こそが、業界の不明瞭な慣習との差別化だと私たちは考えています。
        </p>
      </div>

      {/* Section 1: Screening Process */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">1. 選考プロセス</h2>
          <p className="text-sm text-gray-500">
            すべてのカウンセラーが登録前に通過する6つのゲート。
          </p>
        </div>
        <ol className="space-y-4">
          {SCREENING_STEPS.map((step, i) => (
            <li key={step.title}>
              <Card className="border-l-4 border-l-emerald-400">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <step.icon className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Section 2: Tier Criteria */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">2. レベル昇格基準</h2>
          <p className="text-sm text-gray-500">
            カウンセラーは実績・評価・倫理遵守によって4段階を昇格します。曖昧な推薦ではなく数値基準です。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TIERS.map((tier) => (
            <Card key={tier.slug} className={`ring-2 ring-inset ${tier.ring}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{tier.label}</h3>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">
                      {tier.slug}
                    </p>
                  </div>
                  <Badge className={tier.badge}>Level {tier.slug.toUpperCase()}</Badge>
                </div>
                <ul className="space-y-2">
                  {tier.criteria.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 3: Safeguards */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">3. セーフガード</h2>
          <p className="text-sm text-gray-500">
            選考通過後も、利用者保護のための継続的な仕組みを運用します。
          </p>
        </div>
        <div className="space-y-4">
          {SAFEGUARDS.map((s) => (
            <Card key={s.title}>
              <CardContent className="p-5 flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 4: 4-Layer Meaning */}
      <section className="mb-16">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0">
          <CardContent className="p-8 md:p-10">
            <Layers className="h-8 w-8 text-emerald-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. なぜ、ここまで厳格に審査するのか
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
              スピリチュアルカウンセリングは、Body（身体）・Mind（思考）・Heart（感情）・Spirit（魂）の4層すべてに触れる営みです。
              この領域は、クライアントが最も無防備になる瞬間を扱います。だからこそ、技術の高さだけでは足りません。
              倫理的な誠実さ——恐怖を煽らないこと、万能感を装わないこと、境界線を守ること——が同等に求められます。
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              私たちが公開するこの基準は、クライアントの皆さまが安心して自分を委ねられる土台であり、
              また志あるカウンセラーが誇りを持って名乗れる所属の証明でもあります。
              「厳選」を数字で示すこと——それが私たちの4層アプローチの核心です。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer CTA */}
      <section className="text-center border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">次の一歩へ</h2>
        <p className="text-gray-500 mb-8">
          基準を知ったあなたへ、二つの入り口をご用意しています。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/counselors">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              この基準をクリアしたカウンセラーと話す
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link
            href="mailto:counselor-apply@aicreonext.com?subject=%E3%82%AB%E3%82%A6%E3%83%B3%E3%82%BB%E3%83%A9%E3%83%BC%E5%BF%9C%E5%8B%9F"
            className="text-sm text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
          >
            カウンセラーとして参加を希望する方
          </Link>
        </div>
      </section>
    </div>
  )
}
