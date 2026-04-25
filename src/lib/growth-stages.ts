import type { GrowthStage } from '@/types/database'

export type StageDefinition = {
  slug: GrowthStage
  label: string
  romaji: string
  description: string
  requirements: {
    sessions: number
    journals: number
    reviews: number
    distinct_counselors?: number
  }
  perks: string[]
}

export const GROWTH_STAGES: StageDefinition[] = [
  {
    slug: 'shoshin',
    label: '初心',
    romaji: 'Shoshin',
    description: '旅のはじまり。最初のセッションへようこそ。',
    requirements: { sessions: 0, journals: 0, reviews: 0 },
    perks: ['ウェルカムガイド', '初回セッション振り返りテンプレート'],
  },
  {
    slug: 'shinka',
    label: '深化',
    romaji: 'Shinka',
    description: '対話を重ね、内省が深まる段階。',
    requirements: { sessions: 3, journals: 2, reviews: 1 },
    perks: ['カウンセラーマッチング優先', 'キュレーションされた読書リスト'],
  },
  {
    slug: 'musubi',
    label: '結',
    romaji: 'Musubi',
    description: '学びが統合され、日常に結ばれる段階。',
    requirements: { sessions: 8, journals: 6, reviews: 3, distinct_counselors: 2 },
    perks: ['年1回の無料30分統合セッション', 'ワークショップ早期アクセス'],
  },
]

export function computeStage(stats: {
  sessions: number
  journals: number
  reviews: number
  distinct_counselors: number
}): GrowthStage {
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    const stage = GROWTH_STAGES[i]
    const req = stage.requirements
    const meets =
      stats.sessions >= req.sessions &&
      stats.journals >= req.journals &&
      stats.reviews >= req.reviews &&
      (req.distinct_counselors === undefined ||
        stats.distinct_counselors >= req.distinct_counselors)
    if (meets) return stage.slug
  }
  return GROWTH_STAGES[0].slug
}

export function nextStage(current: GrowthStage): StageDefinition | null {
  const idx = GROWTH_STAGES.findIndex((s) => s.slug === current)
  if (idx < 0 || idx >= GROWTH_STAGES.length - 1) return null
  return GROWTH_STAGES[idx + 1]
}

export function stageBySlug(slug: GrowthStage): StageDefinition {
  const found = GROWTH_STAGES.find((s) => s.slug === slug)
  return found ?? GROWTH_STAGES[0]
}
