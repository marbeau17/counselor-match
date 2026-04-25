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
// HERO
// =============================================================================
export function HeroSection({ props }: { props: AnyProps }) {
  const headline = String(props.headline ?? "")
  const subheadline = String(props.subheadline ?? "")
  const ctaLabel = String(props.cta_label ?? "")
  const ctaUrl = String(props.cta_url ?? "/counselors")
  const bg = props.bg_image_url as string | undefined

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950">
      {bg && (
        <div className="absolute inset-0 -z-10 opacity-30">
          <Image src={bg} alt="" fill className="object-cover" priority />
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {headline}
        </h1>
        {subheadline && (
          <p className="mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {subheadline}
          </p>
        )}
        {ctaLabel && (
          <div className="mt-10">
            <Link href={ctaUrl}>
              <Button size="lg">{ctaLabel} <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        )}
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
// FEATURES
// =============================================================================
export function FeaturesSection({ props }: { props: AnyProps }) {
  const items = (props.items as { icon?: string; title?: string; body?: string }[] | undefined) ?? []
  const cols = (props.columns as number | undefined) ?? 3
  const gridCls = cols === 4 ? "md:grid-cols-4" : cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${gridCls} gap-8`}>
          {items.map((it, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-4">
                <DynamicIcon name={it.icon} className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{it.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// HOW_IT_WORKS
// =============================================================================
export function HowItWorksSection({ props }: { props: AnyProps }) {
  const items = (props.items as { step?: number; title?: string; body?: string; image_url?: string }[] | undefined) ?? []
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          ご利用の流れ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it, i) => (
            <div key={i} className="bg-white dark:bg-gray-950 rounded-lg p-6 border border-gray-100 dark:border-gray-800">
              {it.image_url && (
                <div className="relative w-full h-32 mb-4 rounded overflow-hidden">
                  <Image src={it.image_url} alt={it.title ?? ""} fill className="object-cover" />
                </div>
              )}
              <div className="text-emerald-600 font-bold text-sm">STEP {String(it.step ?? i + 1).padStart(2, "0")}</div>
              <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-gray-100">{it.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{it.body}</p>
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
// TESTIMONIALS
// =============================================================================
export function TestimonialsSection({ props }: { props: AnyProps }) {
  const items = (props.items as { name?: string; role?: string; comment?: string; avatar_url?: string; rating?: number }[] | undefined) ?? []
  if (items.length === 0) return null
  return (
    <section className="py-20 bg-emerald-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          ご利用いただいた方の声
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Avatar src={it.avatar_url} alt={it.name ?? ""} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{it.name}</p>
                    <p className="text-xs text-gray-500">{it.role}</p>
                  </div>
                </div>
                {it.rating && (
                  <div className="mt-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-3 w-3 ${j < (it.rating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                )}
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{it.comment}</p>
              </CardContent>
            </Card>
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
// CTA_BANNER
// =============================================================================
export function CtaBannerSection({ props }: { props: AnyProps }) {
  const bg = props.bg_image_url as string | undefined
  return (
    <section className="relative py-20 overflow-hidden">
      {bg && <Image src={bg} alt="" fill className="object-cover -z-10 opacity-40" />}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 -z-20" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-2xl sm:text-3xl font-bold">{String(props.headline ?? "")}</h2>
        {props.subheadline ? <p className="mt-4 text-lg opacity-90">{String(props.subheadline)}</p> : null}
        {props.cta_label ? (
          <Link href={String(props.cta_url ?? "/register")}>
            <Button size="lg" variant="secondary" className="mt-8">{String(props.cta_label)}</Button>
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
  const items = (props.items as { href?: string; icon?: string; title?: string; body?: string }[] | undefined) ?? []
  if (items.length === 0) return null
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">セルフリフレクション・ツール</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <Link key={i} href={it.href ?? "#"}>
              <Card className="hover:shadow-lg transition-shadow h-full">
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
