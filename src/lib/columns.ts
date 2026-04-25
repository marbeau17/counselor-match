import { createClient } from '@/lib/supabase/server'
import type { ContentColumn, ColumnCategory } from '@/types/database'

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

const now = '2025-01-15T00:00:00.000Z'

// Fallback seed columns used when Supabase unconfigured or empty
export const FALLBACK_COLUMNS: ContentColumn[] = [
  {
    id: 'fallback-soul-mirror-law-intro',
    slug: 'soul-mirror-law-intro',
    title: 'Soul Mirror Lawとは何か',
    category: 'founder',
    author_id: null,
    excerpt:
      '関係性を鏡として、自分の内側に立ち上がる真実を観る。Soul Mirror Lawの基本的な考え方と、日常での使い方を解説します。',
    body: `Soul Mirror Law（ソウル・ミラー・ロウ）は、私たちが他者との関係性の中に見るものを、自分自身の内側の構造を映し出す鏡として扱う考え方です。相手を変えようとするのではなく、相手を通して浮かび上がる自分の感情・信念・未解決のテーマに静かに目を向けます。

この法則の核にあるのは、「外側で強く反応するものは、内側で触れられているものの声」という視点です。怒り、嫉妬、恐れ、憧れ——どの感情も、自分の奥に潜む何かを指し示すサインとして受け取り直します。批判や自己否定の材料にするのではなく、自分を理解するための手がかりとして扱うことが重要です。

実践としては、日常の小さな引っかかりから始めます。誰かの言動に強く反応したとき、その反応を一度保留し、「この感情は自分の中の何に触れているのか」と問い直します。答えを急ぐ必要はありません。身体の感覚、浮かんでくる記憶、呼吸の変化に意識を向けるだけで十分です。

Soul Mirror Lawは、自分を責めるためのものでも、相手を正当化するためのものでもありません。関係性という場を、自分自身と静かに再会するための扉として使うための、ひとつの姿勢です。ホリスティック心理学の4層構造（身体・心・感情・魂）と組み合わせることで、日々の違和感は自己統合の入口へと変わっていきます。`,
    published_at: '2025-01-10T00:00:00.000Z',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'fallback-holistic-psychology-4layers',
    slug: 'holistic-psychology-4layers',
    title: 'ホリスティック心理学の4層構造',
    category: 'founder',
    author_id: null,
    excerpt:
      '身体・心・感情・魂。人間を4つの層として捉え、それぞれの層から本質に近づくホリスティック心理学の全体像を紹介します。',
    body: `ホリスティック心理学は、人間を単一の側面からではなく、相互に影響し合う複数の層として理解するアプローチです。私たちはこの全体像を、身体・心（思考）・感情・魂の4層構造として扱っています。

第一の層は身体です。呼吸の浅さ、肩のこわばり、胃の違和感——身体はもっとも正直な語り手であり、言葉にならない状態を先に知っています。身体感覚への気づきが、すべての内省の土台になります。

第二の層は心、すなわち思考です。自分についての物語、信念、判断のパターンがここに住んでいます。思考は私たちを守るために形成された古い防衛を含んでおり、それを敵視するのではなく、「かつて役に立った知恵」として丁寧に扱います。

第三の層は感情です。感情は抑えたり分析したりする対象ではなく、生きたエネルギーの流れです。感じきることを自分に許すとき、感情は変容し、次の気づきへと道を開きます。

第四の層は魂です。ここは言葉や論理を超えた、自分の本質や生きる方向性に関わる次元です。他の3層が整うにつれて、魂からの声は静かに、しかし明確に聞こえるようになります。

この4層は階層ではなく、同時に存在するひとつの全体です。どの層から入っても、他のすべての層に触れることができます。`,
    published_at: '2025-01-08T00:00:00.000Z',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'fallback-how-to-choose-counselor',
    slug: 'how-to-choose-counselor',
    title: '自分に合うカウンセラーの選び方',
    category: 'seo',
    author_id: null,
    excerpt:
      '初めてカウンセリングを受けるとき、どう選べばよいか迷う方へ。相性を見極めるためのいくつかの視点をまとめました。',
    body: `カウンセラー選びで最初に意識したいのは、「何を解決したいか」よりも「どんな時間を過ごしたいか」です。課題の輪郭はまだはっきりしていなくても構いません。安心して話せる、急がされない、評価されない——そうした場の質が、最終的な変化を左右します。

次に、アプローチの系譜を確認してみてください。認知行動的なアプローチ、ユング派の深層心理、ゲシュタルト、トランスパーソナル、スピリチュアルな視点——それぞれに得意とする問いの種類があります。言葉で整理したい時期もあれば、感じきることが必要な時期もあります。

プロフィールを読むときは、肩書きや資格よりも、その人の言葉の温度に注目します。専門用語が並ぶだけか、自分の体験に根ざした言葉があるか。レビューは星の数より、コメントの具体性を見ます。

最後に、体験セッションを活用してください。一度話してみると、文字情報では分からないリズムや空気が伝わります。合わなければ別の方を選んでよい、と最初から自分に許可を出しておくことが、よい出会いの条件です。`,
    published_at: '2025-01-05T00:00:00.000Z',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'fallback-testimonial-shinka',
    slug: 'testimonial-shinka',
    title: '深化段階で気づいたこと（相談者の声）',
    category: 'testimonial',
    author_id: null,
    excerpt:
      '初信から深化へと移る過程で、日常の見え方がどう変わったか。実際のご相談者の言葉を一部紹介します。',
    body: `「最初の数回は、話すことで楽になる、という段階でした。誰にも言えなかった出来事をただ聞いてもらえる、それだけで呼吸が深くなるのを感じました。

数ヶ月経った頃から、カウンセリングの中で起こっていることが少し変わってきました。話すというより、自分の中の何かが静かに動いている感覚です。カウンセラーの方は、答えをくれるのではなく、私自身が気づくまで側にいてくれました。

ある日、長く続いていた人間関係のパターンが、子どもの頃の別の関係の反復だったと腑に落ちた瞬間がありました。頭では何度も聞いていたことでしたが、その日は身体で分かったのです。その後、同じ状況でも反応が変わっている自分に気づくようになりました。

深化段階と呼ばれるこの時期は、派手な出来事は起こりません。ただ、毎日の小さな選択の質が静かに変わっていきます。」`,
    published_at: '2025-01-02T00:00:00.000Z',
    created_at: now,
    updated_at: now,
  },
]

export async function listPublishedColumns(
  limit?: number
): Promise<ContentColumn[]> {
  const effectiveLimit = limit ?? 20
  if (!isSupabaseConfigured()) {
    return FALLBACK_COLUMNS.slice(0, effectiveLimit)
  }
  try {
    const supabase = await createClient()
    if (!supabase) return FALLBACK_COLUMNS.slice(0, effectiveLimit)
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(effectiveLimit)

    if (error) {
      console.error('[columns] listPublishedColumns error', error)
      return FALLBACK_COLUMNS.slice(0, effectiveLimit)
    }
    if (!data || data.length === 0) {
      return FALLBACK_COLUMNS.slice(0, effectiveLimit)
    }
    return data as ContentColumn[]
  } catch (err) {
    console.error('[columns] listPublishedColumns exception', err)
    return FALLBACK_COLUMNS.slice(0, effectiveLimit)
  }
}

export async function getColumnBySlug(
  slug: string
): Promise<ContentColumn | null> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_COLUMNS.find((c) => c.slug === slug) ?? null
  }
  try {
    const supabase = await createClient()
    if (!supabase) return FALLBACK_COLUMNS.find((c) => c.slug === slug) ?? null
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('[columns] getColumnBySlug error', error)
      return FALLBACK_COLUMNS.find((c) => c.slug === slug) ?? null
    }
    if (!data) {
      return FALLBACK_COLUMNS.find((c) => c.slug === slug) ?? null
    }
    return data as ContentColumn
  } catch (err) {
    console.error('[columns] getColumnBySlug exception', err)
    return FALLBACK_COLUMNS.find((c) => c.slug === slug) ?? null
  }
}

export const COLUMN_CATEGORY_LABELS: Record<ColumnCategory, string> = {
  founder: 'founder columns',
  seo: 'SEO記事',
  counselor: 'カウンセラー',
  testimonial: '体験談',
}
