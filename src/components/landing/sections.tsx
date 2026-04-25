import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { ArrowRight, Star, CheckCircle2, XCircle } from "lucide-react"
import { DynamicIcon } from "./icon"
import { createClient } from "@/lib/supabase/server"

type AnyProps = Record<string, unknown>

// =============================================================================
// HERO (split layout: 左 serif 見出し / 右 人物写真)
// =============================================================================
export function HeroSection({ props }: { props: AnyProps }) {
  const headline = String(props.headline ?? "")
  const subheadline = String(props.subheadline ?? "")
  const ctaLabel = String(props.cta_label ?? "")
  const ctaUrl = String(props.cta_url ?? "/counselors")
  const subCtaLabel = props.sub_cta_label ? String(props.sub_cta_label) : null
  const subCtaUrl = props.sub_cta_url ? String(props.sub_cta_url) : null
  const accentLabel = props.accent_label ? String(props.accent_label) : null
  const photoUrl = props.photo_url as string | undefined
  const photoAlt = String(props.photo_alt ?? "")

  return (
    <section className="relative overflow-hidden bg-base dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* 左: テキスト 7 col */}
          <div className="lg:col-span-7 animate-fadein">
            {accentLabel && (
              <p className="font-accent text-lg text-accent-primary mb-6 tracking-wide">
                {accentLabel}
              </p>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-primary dark:text-gray-100 leading-[1.4] tracking-normal font-medium">
              {headline.split("\n").map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>
            {subheadline && (
              <p className="mt-8 text-base sm:text-lg text-secondary dark:text-gray-300 leading-loose max-w-xl">
                {subheadline}
              </p>
            )}
            {(ctaLabel || subCtaLabel) && (
              <div className="mt-10 flex flex-wrap gap-4 items-center">
                {ctaLabel && (
                  <Link href={ctaUrl}>
                    <Button
                      size="lg"
                      className="bg-accent-warm hover:bg-accent-primary text-white border-0 shadow-sm hover:shadow-md transition-all rounded-full px-8 py-6 text-base"
                    >
                      {ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {subCtaLabel && subCtaUrl && (
                  <Link
                    href={subCtaUrl}
                    className="text-secondary hover:text-accent-primary underline underline-offset-4 transition-colors"
                  >
                    {subCtaLabel}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* 右: 人物写真 5 col (mobile では先頭に来ないよう order) */}
          {photoUrl && (
            <div className="lg:col-span-5 order-first lg:order-last">
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-tl-[80px] rounded-br-[80px] rounded-tr-md rounded-bl-md bg-accent-quiet/40">
                <Image
                  src={photoUrl}
                  alt={photoAlt}
                  fill
                  className="object-cover animate-slow-zoom"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// STORY (新規: ナラティブな共感セクション)
// =============================================================================
export function StoryNarrativeSection({ props }: { props: AnyProps }) {
  const eyebrow = props.eyebrow ? String(props.eyebrow) : null
  const heading = props.heading ? String(props.heading) : null
  const paragraphs = (props.paragraphs as string[] | undefined) ?? []
  const signature = props.signature ? String(props.signature) : null
  if (paragraphs.length === 0) return null
  return (
    <section className="bg-base dark:bg-gray-950 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <article className="prose-quiet">
          {eyebrow && (
            <p className="font-accent text-base text-accent-primary mb-4 tracking-wide">
              — {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="font-serif text-2xl sm:text-3xl text-primary dark:text-gray-100 mb-10 leading-relaxed font-medium">
              {heading}
            </h2>
          )}
          <div className="space-y-7 text-base sm:text-lg text-secondary dark:text-gray-300 leading-loose">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {signature && (
            <p className="mt-12 text-sm text-muted dark:text-gray-500 font-accent italic">
              — {signature}
            </p>
          )}
        </article>
      </div>
    </section>
  )
}

// =============================================================================
// HERO_VIDEO
// =============================================================================
export function HeroVideoSection({ props }: { props: AnyProps }) {
  const videoUrl = props.video_url as string | undefined
  const poster = props.poster_url as string | undefined
  return (
    <section className="relative overflow-hidden h-[70vh] min-h-[480px]">
      {videoUrl ? (
        <video
          className="absolute inset-0 w-full h-full object-cover -z-10"
          src={videoUrl}
          poster={poster}
          autoPlay muted loop playsInline
        />
      ) : poster ? (
        <Image src={poster} alt="" fill className="object-cover -z-10" priority />
      ) : null}
      <div className="absolute inset-0 bg-black/40 -z-10" />
      <div className="relative h-full flex items-center justify-center text-center px-4">
        <div className="text-white">
          <h1 className="text-4xl sm:text-6xl font-bold">{String(props.headline ?? "")}</h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto">{String(props.subheadline ?? "")}</p>
          {props.cta_label ? (
            <Link href={String(props.cta_url ?? "/counselors")}>
              <Button size="lg" className="mt-8">{String(props.cta_label)}</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// TRUST_BAR
// =============================================================================
export function TrustBarSection({ props }: { props: AnyProps }) {
  const items = (props.items as { label?: string; image_url?: string }[] | undefined) ?? []
  if (items.length === 0) return null
  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-sm text-gray-600 dark:text-gray-300">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2">
              {it.image_url
                ? <Image src={it.image_url} alt={it.label ?? ""} width={32} height={32} />
                : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              <span>{it.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// =============================================================================
// FEATURES (改修: ナンバリング + 縦線アクセント, warm カラー)
// =============================================================================
export function FeaturesSection({ props }: { props: AnyProps }) {
  const items = (props.items as { icon?: string; title?: string; body?: string; image_url?: string }[] | undefined) ?? []
  const cols = (props.columns as number | undefined) ?? 3
  const gridCls = cols === 4 ? "md:grid-cols-4" : cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
  const heading = String(props.heading ?? "")
  const eyebrow = props.eyebrow ? String(props.eyebrow) : null
  return (
    <section className="py-20 sm:py-28 bg-base dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {(heading || eyebrow) && (
          <div className="text-center mb-14">
            {eyebrow && (
              <p className="font-accent text-base text-accent-primary mb-3 tracking-wide">
                — {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="font-serif text-3xl sm:text-4xl text-primary dark:text-gray-100 leading-snug font-medium">
                {heading}
              </h2>
            )}
          </div>
        )}
        <div className={`grid grid-cols-1 ${gridCls} gap-10 sm:gap-12`}>
          {items.map((it, i) => (
            <div key={i} className="text-left animate-fadein" style={{ animationDelay: `${i * 100}ms` }}>
              {it.image_url && (
                <div className="relative w-full aspect-[4/5] mb-6 overflow-hidden rounded-tl-3xl rounded-br-3xl bg-accent-quiet/40">
                  <Image src={it.image_url} alt={it.title ?? ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
              <p className="font-accent text-sm text-accent-primary mb-2 tracking-wider">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-serif text-xl sm:text-2xl text-primary dark:text-gray-100 mb-3 font-medium leading-snug">
                {it.title}
              </h3>
              <p className="text-sm sm:text-base text-secondary dark:text-gray-400 leading-loose">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// HOW_IT_WORKS (改修: warm card + serif heading)
// =============================================================================
export function HowItWorksSection({ props }: { props: AnyProps }) {
  const items = (props.items as { step?: number; title?: string; body?: string; image_url?: string }[] | undefined) ?? []
  const heading = props.heading ? String(props.heading) : "ご利用の流れ"
  const eyebrow = props.eyebrow ? String(props.eyebrow) : null
  return (
    <section className="py-20 sm:py-28 bg-accent-quiet/20 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          {eyebrow && (
            <p className="font-accent text-base text-accent-primary mb-3 tracking-wide">
              — {eyebrow}
            </p>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl text-primary dark:text-gray-100 leading-snug font-medium">
            {heading}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((it, i) => (
            <div
              key={i}
              className="bg-card dark:bg-gray-950 p-7 border border-accent-quiet/60 dark:border-gray-800 rounded-tl-2xl rounded-br-2xl"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {it.image_url && (
                <div className="relative w-full h-36 mb-5 rounded overflow-hidden">
                  <Image src={it.image_url} alt={it.title ?? ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
                </div>
              )}
              <p className="font-accent text-base text-accent-primary tracking-wider">
                Step {String(it.step ?? i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-serif text-lg text-primary dark:text-gray-100 font-medium leading-snug">
                {it.title}
              </h3>
              <p className="mt-3 text-sm text-secondary dark:text-gray-400 leading-loose">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// COUNSELOR_SHOWCASE (DB から取得)
// =============================================================================
export async function CounselorShowcaseSection({ props }: { props: AnyProps }) {
  const count = (props.count as number | undefined) ?? 3
  const filter = (props.filter as { level?: string } | undefined) ?? {}
  const ctaUrl = String(props.cta_url ?? "/counselors")

  let counselors: Array<{ id: string; level: string; title: string | null; rating_average: number; rating_count: number; profiles: { display_name: string | null; full_name: string; avatar_url: string | null } | null }> = []
  try {
    const supabase = await createClient()
    if (supabase) {
      let q = supabase
        .from("counselors")
        .select("id, level, title, rating_average, rating_count, profiles(display_name, full_name, avatar_url)")
        .eq("is_active", true)
        .order("rating_average", { ascending: false })
        .limit(count)
      if (filter.level) q = q.eq("level", filter.level)
      const { data } = await q
      counselors = (data as unknown as typeof counselors) ?? []
    }
  } catch {}

  if (counselors.length === 0) return null

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          注目のカウンセラー
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {counselors.map((c) => {
            const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
            return (
              <Link key={c.id} href={`/counselors/${c.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Avatar src={p?.avatar_url ?? undefined} alt={p?.display_name || p?.full_name || ""} size="lg" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{p?.display_name || p?.full_name}</p>
                        <Badge variant="secondary">{c.level}</Badge>
                      </div>
                    </div>
                    {c.title && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{c.title}</p>}
                    {c.rating_count > 0 && (
                      <div className="mt-3 flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        {Number(c.rating_average).toFixed(1)} ({c.rating_count})
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        <div className="mt-8 text-center">
          <Link href={ctaUrl}><Button variant="outline">すべてのカウンセラーを見る</Button></Link>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// TESTIMONIALS (改修: 縦長引用カード, 大きな引用符, editorial)
// =============================================================================
export function TestimonialsSection({ props }: { props: AnyProps }) {
  const items = (props.items as { name?: string; role?: string; comment?: string; avatar_url?: string; rating?: number }[] | undefined) ?? []
  const heading = props.heading ? String(props.heading) : "ご利用いただいた方の声"
  const eyebrow = props.eyebrow ? String(props.eyebrow) : null
  if (items.length === 0) return null
  return (
    <section className="py-20 sm:py-28 bg-base dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          {eyebrow && (
            <p className="font-accent text-base text-accent-primary mb-3 tracking-wide">
              — {eyebrow}
            </p>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl text-primary dark:text-gray-100 leading-snug font-medium">
            {heading}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((it, i) => (
            <figure
              key={i}
              className="relative bg-card dark:bg-gray-950 p-8 sm:p-10 rounded-tl-3xl rounded-br-3xl border border-accent-quiet/60 dark:border-gray-800 animate-fadein"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span
                aria-hidden
                className="font-serif text-7xl text-accent-primary/30 leading-none absolute top-4 left-6"
              >
                &ldquo;
              </span>
              {it.rating && (
                <div className="flex gap-0.5 mb-4 relative">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-3.5 w-3.5 ${j < (it.rating ?? 0) ? "text-accent-warm fill-accent-warm" : "text-gray-300"}`} />
                  ))}
                </div>
              )}
              <blockquote className="relative font-serif text-base sm:text-lg text-primary dark:text-gray-100 leading-loose mb-6">
                {it.comment}
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-5 border-t border-accent-quiet/60 dark:border-gray-800">
                {it.avatar_url ? (
                  <Avatar src={it.avatar_url} alt={it.name ?? ""} size="md" />
                ) : (
                  <div
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-accent-quiet text-accent-primary font-accent text-sm tracking-wider"
                    aria-hidden
                  >
                    {(it.name ?? "").replace(/\s*さん$/, "").slice(0, 3) || "—"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-primary dark:text-gray-100">{it.name}</p>
                  <p className="text-xs text-muted dark:text-gray-500">{it.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// MEDIA_LOGOS
// =============================================================================
export function MediaLogosSection({ props }: { props: AnyProps }) {
  const logos = (props.logos as { alt?: string; image_url?: string }[] | undefined) ?? []
  if (logos.length === 0) return null
  return (
    <section className="py-12 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-wider text-gray-400 mb-6">メディア掲載</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
          {logos.map((l, i) => l.image_url ? (
            <Image key={i} src={l.image_url} alt={l.alt ?? ""} width={120} height={40} className="object-contain" />
          ) : null)}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// PRICING
// =============================================================================
export function PricingSection({ props }: { props: AnyProps }) {
  const plans = (props.plans as { name?: string; price?: string; features?: string[]; highlight?: boolean }[] | undefined) ?? []
  if (plans.length === 0) return null
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">料金プラン</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <Card key={i} className={p.highlight ? "ring-2 ring-emerald-500" : ""}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-2 text-3xl font-bold text-emerald-600">{p.price}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {(p.features ?? []).map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// FAQ
// =============================================================================
export function FaqSection({ props }: { props: AnyProps }) {
  const items = (props.items as { q?: string; a?: string }[] | undefined) ?? []
  if (items.length === 0) return null
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-10">よくあるご質問</h2>
        <div className="space-y-3">
          {items.map((it, i) => (
            <details key={i} className="group bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100">Q. {it.q}</summary>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">A. {it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// GALLERY (画像のみで雰囲気を伝える / warm version)
// =============================================================================
export function GallerySection({ props }: { props: AnyProps }) {
  const items = (props.items as { image_url?: string; alt?: string; caption?: string }[] | undefined) ?? []
  const heading = String(props.heading ?? "")
  const subheading = String(props.subheading ?? "")
  const eyebrow = props.eyebrow ? String(props.eyebrow) : null
  if (items.length === 0) return null
  return (
    <section className="py-20 sm:py-28 bg-base dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {(heading || subheading || eyebrow) && (
          <div className="text-center mb-14">
            {eyebrow && (
              <p className="font-accent text-base text-accent-primary mb-3 tracking-wide">
                — {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="font-serif text-3xl sm:text-4xl text-primary dark:text-gray-100 leading-snug font-medium">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-4 text-base text-secondary dark:text-gray-300 max-w-xl mx-auto leading-loose">
                {subheading}
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((it, i) => (
            <figure
              key={i}
              className={`relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 ${
                i % 5 === 0 ? "aspect-[4/5] md:row-span-2" : "aspect-square"
              }`}
            >
              {it.image_url && (
                <Image
                  src={it.image_url}
                  alt={it.alt ?? it.caption ?? ""}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
              {it.caption && (
                <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white">
                  {it.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// CTA_BANNER (改修: warm + serif, soft layered bg)
// =============================================================================
export function CtaBannerSection({ props }: { props: AnyProps }) {
  const bg = props.bg_image_url as string | undefined
  const eyebrow = props.eyebrow ? String(props.eyebrow) : null
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {bg && (
        <Image src={bg} alt="" fill className="object-cover -z-10 opacity-50" sizes="100vw" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/85 to-accent-warm/70 -z-20" />
      <div className="absolute inset-0 bg-primary/20 -z-30" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center text-white">
        {eyebrow && (
          <p className="font-accent text-base text-white/80 mb-4 tracking-wide">— {eyebrow}</p>
        )}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-snug font-medium">
          {String(props.headline ?? "")}
        </h2>
        {props.subheadline ? (
          <p className="mt-6 text-base sm:text-lg text-white/90 leading-loose max-w-xl mx-auto">
            {String(props.subheadline)}
          </p>
        ) : null}
        {props.cta_label ? (
          <Link href={String(props.cta_url ?? "/register")}>
            <Button
              size="lg"
              className="mt-10 bg-white hover:bg-accent-quiet text-accent-primary border-0 shadow-md hover:shadow-lg rounded-full px-8 py-6 text-base"
            >
              {String(props.cta_label)} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : null}
      </div>
    </section>
  )
}

// =============================================================================
// TOOLS_PROMO
// =============================================================================
export function ToolsPromoSection({ props }: { props: AnyProps }) {
  const items = (props.items as { href?: string; icon?: string; title?: string; body?: string; image_url?: string }[] | undefined) ?? []
  if (items.length === 0) return null
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">セルフリフレクション・ツール</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <Link key={i} href={it.href ?? "#"}>
              <Card className="hover:shadow-lg transition-shadow h-full overflow-hidden">
                {it.image_url && (
                  <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-gray-900">
                    <Image src={it.image_url} alt={it.title ?? ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                )}
                <CardContent className="p-6">
                  <DynamicIcon name={it.icon} className="h-6 w-6 text-emerald-600" />
                  <h3 className="mt-3 font-semibold text-gray-900 dark:text-gray-100">{it.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{it.body}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// COLUMN_PROMO (DB から取得)
// =============================================================================
export async function ColumnPromoSection({ props }: { props: AnyProps }) {
  const count = (props.count as number | undefined) ?? 3
  let columns: Array<{ id: string; slug: string; title: string; excerpt: string | null; published_at: string | null }> = []
  try {
    const supabase = await createClient()
    if (supabase) {
      const { data } = await supabase
        .from("columns")
        .select("id, slug, title, excerpt, published_at")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(count)
      columns = (data as typeof columns) ?? []
    }
  } catch {}
  if (columns.length === 0) return null

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">最新コラム</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((c) => (
            <Link key={c.id} href={`/column/${c.slug}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{c.title}</h3>
                  {c.excerpt && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{c.excerpt}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// COMPARISON_TABLE
// =============================================================================
export function ComparisonTableSection({ props }: { props: AnyProps }) {
  const cols = (props.columns as string[] | undefined) ?? []
  const rows = (props.rows as { label?: string; values?: boolean[] }[] | undefined) ?? []
  if (cols.length === 0 || rows.length === 0) return null
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">他サービスとの比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left"></th>
                {cols.map((c, i) => (
                  <th key={i} className={`px-4 py-3 text-center ${i === 0 ? "text-emerald-600 font-bold" : ""}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-medium">{r.label}</td>
                  {(r.values ?? []).map((v, j) => (
                    <td key={j} className="px-4 py-3 text-center">
                      {v ? <CheckCircle2 className="h-5 w-5 text-emerald-500 inline" /> : <XCircle className="h-5 w-5 text-gray-300 inline" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// STATS_COUNTER
// =============================================================================
export function StatsCounterSection({ props }: { props: AnyProps }) {
  const items = (props.items as { value?: string; label?: string; suffix?: string }[] | undefined) ?? []
  if (items.length === 0) return null
  return (
    <section className="py-16 bg-emerald-600 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(items.length, 4)} gap-8 text-center`}>
          {items.map((it, i) => (
            <div key={i}>
              <p className="text-4xl sm:text-5xl font-bold">{it.value}<span className="text-2xl ml-1">{it.suffix}</span></p>
              <p className="mt-2 text-sm opacity-90">{it.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// BEFORE_AFTER
// =============================================================================
export function BeforeAfterSection({ props }: { props: AnyProps }) {
  const items = (props.items as { before?: string; after?: string; image_url?: string }[] | undefined) ?? []
  if (items.length === 0) return null
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">利用前 / 利用後</h2>
        <div className="space-y-6">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card><CardContent className="p-6">
                <Badge variant="destructive" className="mb-2">Before</Badge>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{it.before}</p>
              </CardContent></Card>
              <Card className="ring-2 ring-emerald-500"><CardContent className="p-6">
                <Badge variant="default" className="mb-2">After</Badge>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{it.after}</p>
              </CardContent></Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// STORY
// =============================================================================
export function StorySection({ props }: { props: AnyProps }) {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {props.image_url ? (
          <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            <Image src={String(props.image_url)} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 aspect-square rounded-lg" />
        )}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{String(props.headline ?? "")}</h2>
          <p className="mt-6 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{String(props.body ?? "")}</p>
          {(props.author_name || props.author_role) ? (
            <p className="mt-6 text-sm text-gray-500">— {String(props.author_name ?? "")} {props.author_role ? `/ ${String(props.author_role)}` : ""}</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// LEAD_CAPTURE (※ 送信先は将来 list_id とサーバー実装が必要)
// =============================================================================
export function LeadCaptureSection({ props }: { props: AnyProps }) {
  return (
    <section className="py-20 bg-emerald-50 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{String(props.headline ?? "")}</h2>
        {props.subheadline ? <p className="mt-3 text-gray-600 dark:text-gray-400">{String(props.subheadline)}</p> : null}
        <form className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            required
            placeholder="メールアドレス"
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 flex-1 max-w-sm"
          />
          <Button type="submit">{String(props.submit_label ?? "登録する")}</Button>
        </form>
      </div>
    </section>
  )
}

// =============================================================================
// RICH_TEXT
// =============================================================================
export function RichTextSection({ props }: { props: AnyProps }) {
  const md = String(props.markdown ?? "")
  const maxW = String(props.max_width ?? "max-w-3xl")
  const paragraphs = md.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className={`mx-auto ${maxW} px-4 sm:px-6 lg:px-8`}>
        {paragraphs.map((p, i) => (
          <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 whitespace-pre-wrap">{p}</p>
        ))}
      </div>
    </section>
  )
}

// =============================================================================
// MARQUEE (CSS animation)
// =============================================================================
export function MarqueeSection({ props }: { props: AnyProps }) {
  const items = (props.items as string[] | undefined) ?? []
  if (items.length === 0) return null
  return (
    <section className="py-6 bg-emerald-600 text-white overflow-hidden border-y border-emerald-700">
      <div className="flex animate-marquee whitespace-nowrap gap-12 text-sm">
        {[...items, ...items].map((s, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            {s}
          </span>
        ))}
      </div>
    </section>
  )
}

// =============================================================================
// VIDEO_EMBED
// =============================================================================
export function VideoEmbedSection({ props }: { props: AnyProps }) {
  const url = props.embed_url as string | undefined
  if (!url) return null
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {props.headline ? <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">{String(props.headline)}</h2> : null}
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <iframe src={url} className="w-full h-full" allowFullScreen title={String(props.headline ?? "video")} />
        </div>
        {props.caption ? <p className="mt-3 text-center text-sm text-gray-500">{String(props.caption)}</p> : null}
      </div>
    </section>
  )
}

// =============================================================================
// CERTIFICATIONS
// =============================================================================
export function CertificationsSection({ props }: { props: AnyProps }) {
  const items = (props.items as { label?: string; image_url?: string; link?: string }[] | undefined) ?? []
  if (items.length === 0) return null
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs uppercase tracking-wider text-gray-400 mb-6">認定 / 資格</p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {items.map((it, i) => {
            const inner = (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                {it.image_url && <Image src={it.image_url} alt={it.label ?? ""} width={40} height={40} className="object-contain" />}
                <span>{it.label}</span>
              </div>
            )
            return it.link ? <a key={i} href={it.link} target="_blank" rel="noopener noreferrer">{inner}</a> : <div key={i}>{inner}</div>
          })}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// FAQ_QA (LLMO: FAQPage schema + 視覚 accordion 風)
// =============================================================================
export function FaqQaSection({ props }: { props: AnyProps }) {
  const items = (props.items as { question?: string; answer?: string }[] | undefined) ?? []
  const heading = props.heading ? String(props.heading) : "よくあるご質問"
  const eyebrow = props.eyebrow ? String(props.eyebrow) : "FAQ"
  if (items.length === 0) return null

  // FAQPage JSON-LD (LLMO 引用最適化)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items
      .filter((it) => it.question && it.answer)
      .map((it) => ({
        "@type": "Question",
        name: it.question,
        acceptedAnswer: { "@type": "Answer", text: it.answer },
      })),
  }

  return (
    <section className="py-20 sm:py-28 bg-base dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {eyebrow && (
            <p className="font-accent text-base text-accent-primary mb-3 tracking-wide">— {eyebrow}</p>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl text-primary dark:text-gray-100 leading-snug font-medium">
            {heading}
          </h2>
        </div>
        <dl className="space-y-4">
          {items.map((it, i) => (
            <details
              key={i}
              className="group bg-card dark:bg-gray-950 border border-accent-quiet/60 dark:border-gray-800 rounded-tl-2xl rounded-br-2xl p-6 sm:p-7"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-serif text-base sm:text-lg text-primary dark:text-gray-100 font-medium leading-relaxed">
                <span>{it.question}</span>
                <span className="text-accent-primary group-open:rotate-45 transition-transform shrink-0 mt-1" aria-hidden>
                  +
                </span>
              </summary>
              <div className="mt-4 pt-4 border-t border-accent-quiet/40 dark:border-gray-800 text-sm sm:text-base text-secondary dark:text-gray-300 leading-loose whitespace-pre-line">
                {it.answer}
              </div>
            </details>
          ))}
        </dl>
      </div>
    </section>
  )
}

// =============================================================================
// HOWTO_STEPS_V2 (LLMO: HowTo schema + 番号付きステップ)
// =============================================================================
export function HowtoStepsV2Section({ props }: { props: AnyProps }) {
  const items = (props.items as { name?: string; text?: string; image_url?: string }[] | undefined) ?? []
  const heading = props.heading ? String(props.heading) : "進め方"
  const eyebrow = props.eyebrow ? String(props.eyebrow) : "HowTo"
  const totalTime = props.total_time ? String(props.total_time) : null
  if (items.length === 0) return null

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: heading,
    step: items
      .filter((it) => it.name)
      .map((it, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: it.name,
        text: it.text,
        ...(it.image_url ? { image: it.image_url } : {}),
      })),
  }
  if (totalTime) jsonLd.totalTime = totalTime

  return (
    <section className="py-20 sm:py-28 bg-accent-quiet/20 dark:bg-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {eyebrow && (
            <p className="font-accent text-base text-accent-primary mb-3 tracking-wide">— {eyebrow}</p>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl text-primary dark:text-gray-100 leading-snug font-medium">
            {heading}
          </h2>
        </div>
        <ol className="space-y-8">
          {items.map((it, i) => (
            <li key={i} className="flex gap-6 items-start">
              <span className="font-accent text-3xl text-accent-primary shrink-0 leading-none mt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <h3 className="font-serif text-xl text-primary dark:text-gray-100 font-medium leading-snug mb-2">
                  {it.name}
                </h3>
                {it.text && (
                  <p className="text-base text-secondary dark:text-gray-300 leading-loose whitespace-pre-line">
                    {it.text}
                  </p>
                )}
                {it.image_url && (
                  <div className="relative w-full aspect-[16/9] mt-4 rounded-lg overflow-hidden">
                    <Image src={it.image_url} alt={it.name ?? ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// =============================================================================
// CITATIONS (出典・引用 / E-E-A-T 強化)
// =============================================================================
export function CitationsSection({ props }: { props: AnyProps }) {
  const items = (props.items as { url?: string; title?: string; author?: string; date?: string }[] | undefined) ?? []
  const heading = props.heading ? String(props.heading) : "引用・参考文献"
  const eyebrow = props.eyebrow ? String(props.eyebrow) : "References"
  if (items.length === 0) return null

  return (
    <section className="py-16 bg-base dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="font-accent text-sm text-accent-primary mb-2 tracking-wide">— {eyebrow}</p>
        )}
        <h2 className="font-serif text-xl sm:text-2xl text-primary dark:text-gray-100 mb-6 font-medium">
          {heading}
        </h2>
        <ul className="space-y-3 text-sm text-secondary dark:text-gray-400">
          {items.map((it, i) => (
            <li key={i} className="border-l-2 border-accent-primary/40 pl-4 py-1">
              {it.url ? (
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary underline underline-offset-2 hover:text-primary transition-colors"
                >
                  {it.title ?? it.url}
                </a>
              ) : (
                <span className="text-primary dark:text-gray-200">{it.title}</span>
              )}
              {(it.author || it.date) && (
                <p className="text-xs text-muted dark:text-gray-500 mt-1">
                  {it.author && <span>{it.author}</span>}
                  {it.author && it.date && <span> · </span>}
                  {it.date && <time>{it.date}</time>}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// =============================================================================
// EXPERT_AUTHORSHIP (E-E-A-T: 著者・運営者の専門性訴求)
// =============================================================================
export function ExpertAuthorshipSection({ props }: { props: AnyProps }) {
  const name = props.name ? String(props.name) : ""
  const role = props.role ? String(props.role) : ""
  const bio = props.bio ? String(props.bio) : ""
  const credentials = (props.credentials as string[] | undefined) ?? []
  const photoUrl = props.photo_url ? String(props.photo_url) : null
  const updatedAt = props.updated_at ? String(props.updated_at) : null

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(role ? { jobTitle: role } : {}),
    ...(bio ? { description: bio } : {}),
    ...(credentials.length > 0 ? { hasCredential: credentials } : {}),
  }

  return (
    <section className="py-16 bg-accent-quiet/20 dark:bg-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
          {photoUrl && (
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-accent-quiet shrink-0">
              <Image src={photoUrl} alt={name} fill className="object-cover" sizes="128px" />
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <p className="font-accent text-sm text-accent-primary mb-1">— Author</p>
            <h2 className="font-serif text-2xl text-primary dark:text-gray-100 font-medium">{name}</h2>
            {role && <p className="text-sm text-secondary dark:text-gray-400 mt-1">{role}</p>}
            {bio && (
              <p className="mt-4 text-sm text-secondary dark:text-gray-300 leading-loose whitespace-pre-line">
                {bio}
              </p>
            )}
            {credentials.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                {credentials.map((c, i) => (
                  <li key={i} className="text-xs px-3 py-1 rounded-full bg-card border border-accent-quiet text-accent-primary">
                    {c}
                  </li>
                ))}
              </ul>
            )}
            {updatedAt && (
              <p className="mt-4 text-xs text-muted dark:text-gray-500 font-accent italic">
                Last reviewed: <time dateTime={updatedAt}>{updatedAt}</time>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// TLDR (LLM 引用しやすい要約ボックス)
// =============================================================================
export function TldrSection({ props }: { props: AnyProps }) {
  const summary = props.summary ? String(props.summary) : ""
  const heading = props.heading ? String(props.heading) : "TL;DR — このページの要約"
  if (!summary) return null

  // Question/Answer 形式の JSON-LD で LLM が引用しやすく
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Question",
    name: heading,
    acceptedAnswer: { "@type": "Answer", text: summary },
  }

  return (
    <section className="py-12 bg-base dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <aside
          aria-label={heading}
          className="bg-accent-quiet/30 dark:bg-gray-900 border-l-4 border-accent-primary p-6 sm:p-8 rounded-tr-xl rounded-br-xl"
        >
          <p className="font-accent text-sm text-accent-primary mb-2">— TL;DR</p>
          <p className="font-serif text-base sm:text-lg text-primary dark:text-gray-100 leading-loose whitespace-pre-line">
            {summary}
          </p>
        </aside>
      </div>
    </section>
  )
}
