import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getColumnBySlug,
  listPublishedColumns,
  COLUMN_CATEGORY_LABELS,
} from '@/lib/columns'

type Params = { slug: string }

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

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const column = await getColumnBySlug(slug)
  if (!column) {
    return {
      title: 'コラムが見つかりません',
    }
  }
  return {
    title: column.title,
    description: column.excerpt ?? undefined,
    openGraph: {
      title: column.title,
      description: column.excerpt ?? undefined,
      type: 'article',
    },
  }
}

export default async function ColumnDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const column = await getColumnBySlug(slug)
  if (!column) {
    notFound()
  }

  const allPublished = await listPublishedColumns(50)
  const related = allPublished
    .filter((c) => c.category === column.category && c.slug !== column.slug)
    .slice(0, 3)

  const paragraphs = column.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

  return (
    <article className="py-16 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/column"
            className="text-sm text-emerald-700 hover:underline"
          >
            ← コラム一覧へ戻る
          </Link>
        </div>

        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="font-normal">
              {COLUMN_CATEGORY_LABELS[column.category]}
            </Badge>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(column.published_at)}
            </span>
            {column.author_id && (
              <span className="text-xs text-gray-400 dark:text-gray-500">著者: {column.author_id}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
            {column.title}
          </h1>
          {column.excerpt && (
            <p className="mt-4 text-base text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed">
              {column.excerpt}
            </p>
          )}
        </header>

        <div className="prose prose-neutral max-w-none" style={{ whiteSpace: 'normal' }}>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-gray-800 dark:text-gray-200 leading-[1.9] mb-6"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {p}
            </p>
          ))}
        </div>

        {related.length > 0 && (
          <footer className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              関連するコラム
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/column/${r.slug}`}
                  className="group block"
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="font-normal">
                          {COLUMN_CATEGORY_LABELS[r.category]}
                        </Badge>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(r.published_at)}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 leading-snug">
                        {r.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </footer>
        )}
      </div>
    </article>
  )
}
