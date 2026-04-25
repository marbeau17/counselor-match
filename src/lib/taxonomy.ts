export type Concern = {
  slug: string // english snake_case id used in DB filters
  label: string // Japanese display label
  icon?: string // optional lucide-react icon name
}

export type Methodology = {
  slug: string
  label: string
  family: 'holistic' | 'spiritual' | 'divination'
  description: string // one-line JP description
}

export const CONCERNS: Concern[] = [
  { slug: 'love', label: '恋愛・パートナーシップ', icon: 'Heart' },
  { slug: 'work', label: '仕事・キャリア', icon: 'Briefcase' },
  { slug: 'life_purpose', label: '人生の目的・使命', icon: 'Compass' },
  { slug: 'family', label: '家族・人間関係', icon: 'Users' },
  { slug: 'self_understanding', label: '自己理解・内省', icon: 'BookHeart' },
  { slug: 'grief', label: 'グリーフ・喪失', icon: 'CloudRain' },
]

export const METHODOLOGIES: Methodology[] = [
  {
    slug: 'holistic_psychology',
    label: 'ホリスティック心理学',
    family: 'holistic',
    description: '身体・心・感情・魂の4層から本質にアプローチする統合的心理学。',
  },
  {
    slug: 'soul_mirror_law',
    label: 'Soul Mirror Law',
    family: 'holistic',
    description: '他者は魂の鏡。関係性を通じて内側の真実を観る独自メソッド。',
  },
  {
    slug: 'personality_matrix_32',
    label: 'Personality Matrix 32',
    family: 'holistic',
    description: '32タイプの性格構造から個性と役割を読み解く診断体系。',
  },
  {
    slug: 'channeling',
    label: 'チャネリング',
    family: 'spiritual',
    description: '高次の存在やガイドからのメッセージを受け取る対話セッション。',
  },
  {
    slug: 'past_life',
    label: '前世リーディング',
    family: 'spiritual',
    description: '過去生の記憶から現在の課題の根源を紐解く。',
  },
  {
    slug: 'aura_reading',
    label: 'オーラリーディング',
    family: 'spiritual',
    description: 'エネルギーフィールドを視て今の状態を可視化する。',
  },
  {
    slug: 'tarot',
    label: 'タロット',
    family: 'divination',
    description: '78枚のカードを通じた内省と気づきの対話ツール。',
  },
  {
    slug: 'oracle_cards',
    label: 'オラクルカード',
    family: 'divination',
    description: '直感を開くメッセージカード・リーディング。',
  },
  {
    slug: 'astrology',
    label: '占星術',
    family: 'divination',
    description: '出生図から魂の設計図を読み解く。',
  },
  {
    slug: 'numerology',
    label: '数秘術',
    family: 'divination',
    description: '数字のエネルギーから人生のテーマを紐解く。',
  },
]

export const concernBySlug = (slug: string): Concern | undefined =>
  CONCERNS.find((c) => c.slug === slug)

export const methodologyBySlug = (slug: string): Methodology | undefined =>
  METHODOLOGIES.find((m) => m.slug === slug)

export function groupMethodologies(items: Methodology[] = METHODOLOGIES) {
  return {
    holistic: items.filter((m) => m.family === 'holistic'),
    spiritual: items.filter((m) => m.family === 'spiritual'),
    divination: items.filter((m) => m.family === 'divination'),
  }
}
