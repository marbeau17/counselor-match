// Client-safe な section type 定義 (server-only な sections.tsx を巻き込まない)

export const SECTION_LABELS: Record<string, string> = {
  hero: "ヒーロー",
  hero_video: "ヒーロー (動画背景)",
  trust_bar: "信頼バッジ",
  features: "特徴",
  how_it_works: "ご利用の流れ",
  counselor_showcase: "カウンセラー紹介",
  testimonials: "お客様の声",
  media_logos: "メディア掲載",
  pricing: "料金プラン",
  faq: "よくある質問",
  cta_banner: "CTA バナー",
  tools_promo: "ツール紹介",
  column_promo: "最新コラム",
  comparison_table: "比較表",
  stats_counter: "数値実績",
  before_after: "ビフォー / アフター",
  story: "ストーリー",
  lead_capture: "メルマガ登録",
  rich_text: "自由記述",
  marquee: "流れる帯",
  video_embed: "動画埋込",
  certifications: "認定 / 資格",
}

export const SECTION_TYPES = Object.keys(SECTION_LABELS)
