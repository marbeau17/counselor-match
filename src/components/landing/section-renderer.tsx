import {
  HeroSection, HeroVideoSection, TrustBarSection, FeaturesSection,
  HowItWorksSection, CounselorShowcaseSection, TestimonialsSection,
  MediaLogosSection, PricingSection, FaqSection, CtaBannerSection,
  ToolsPromoSection, ColumnPromoSection, ComparisonTableSection,
  StatsCounterSection, BeforeAfterSection, StorySection,
  LeadCaptureSection, RichTextSection, MarqueeSection,
  VideoEmbedSection, CertificationsSection,
} from "./sections"

export { SECTION_LABELS, SECTION_TYPES } from "./section-types"

type AnyProps = Record<string, unknown>
type SectionComp = (args: { props: AnyProps }) => React.ReactNode | Promise<React.ReactNode>

export const SECTION_REGISTRY: Record<string, SectionComp> = {
  hero: HeroSection,
  hero_video: HeroVideoSection,
  trust_bar: TrustBarSection,
  features: FeaturesSection,
  how_it_works: HowItWorksSection,
  counselor_showcase: CounselorShowcaseSection,
  testimonials: TestimonialsSection,
  media_logos: MediaLogosSection,
  pricing: PricingSection,
  faq: FaqSection,
  cta_banner: CtaBannerSection,
  tools_promo: ToolsPromoSection,
  column_promo: ColumnPromoSection,
  comparison_table: ComparisonTableSection,
  stats_counter: StatsCounterSection,
  before_after: BeforeAfterSection,
  story: StorySection,
  lead_capture: LeadCaptureSection,
  rich_text: RichTextSection,
  marquee: MarqueeSection,
  video_embed: VideoEmbedSection,
  certifications: CertificationsSection,
}

export async function SectionRenderer({
  type,
  props,
}: {
  type: string
  props: AnyProps
}) {
  const Component = SECTION_REGISTRY[type]
  if (!Component) return null
  // Server Component (async possible)
  return <>{await Component({ props })}</>
}
