import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  listPublishedColumns,
  COLUMN_CATEGORY_LABELS,
} from '@/lib/columns'
import type { ColumnCategory } from '@/types/database'

export const metadata = {
  title: 'コラム・マガジン',
  description:
    'ホリスティック心理学、Soul Mirror Law、相談者の声。カウンセラーマッチの公式コラム。',
}

type FilterValue = 'all' | ColumnCategory

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'founder', label: 'founder columns' },
  { value: 'seo', label: 'SEO記事' },
  { value: 'counselor', label: 'カウンセラー' },
  { value: 'testimonial', label: '体験談' },
]

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
      d.getDate()
    ).padStart(2, '0')}`
  } catch {
    return ''
  }
}

function isValidCategory(v: string | undefined): v is ColumnCategory {
  return v === 'founder' || v === 'seo' || v === 'counselor' || v === 'testimonial'
}

export default async function ColumnIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>
}) {
  const params = (await searchParams) ?? {}
  const active: FilterValue = isValidCategory(params.category)
    ? params.category
    : 'all'

  const all = await listPublishedColumns(50)
  const columns =
    active === 'all' ? all : all.filter((c) => c.category === active)

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            コラム・マガジン
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
            ホリスティック心理学とSoul Mirror Lawにまつわる、日々の気づき。
          </p>
        </header>

        {/* Filter chips */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => {
            const isActive = f.value === active
            const href =
              f.value === 'all' ? '/column' : `/column?category=${f.value}`
            return (
              <Link
                key={f.value}
                href={href}
                className={
                  isActive
                    ? 'inline-flex items-center rounded-full bg-emerald-600 text-white px-4 py-1.5 text-sm font-medium'
                    : 'inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 px-4 py-1.5 text-sm font-medium'
                }
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {columns.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
              該当するコラムはまだありません。別のカテゴリーをお試しください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {columns.map((c) => (
              <Link key={c.id} href={`/column/${c.slug}`} className="group block">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {COLUMN_CATEGORY_LABELS[c.category]}
                      </Badge>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(c.published_at)}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 mb-3 leading-snug">
                      {c.title}
                    </h2>
                    {c.excerpt && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-4">
                        {c.excerpt}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
