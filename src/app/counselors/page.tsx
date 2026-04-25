'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X, Sparkles, Compass, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CounselorCard } from '@/components/counselor/counselor-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { CONCERNS, METHODOLOGIES, groupMethodologies } from '@/lib/taxonomy'
import { mockCounselors } from '@/lib/mock-data'
import type { Counselor, Profile } from '@/types/database'

type CounselorRow = Counselor & { profiles?: Profile } & Record<string, unknown>

export default function CounselorsPage() {
  const [counselors, setCounselors] = useState<CounselorRow[]>(mockCounselors as CounselorRow[])
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [selectedMethodologies, setSelectedMethodologies] = useState<string[]>([])
  const [onlineOnlyFilter, setOnlineOnlyFilter] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const hasSupabase =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!hasSupabase) return
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        if (!supabase) return
        const { data, error } = await supabase
          .from('counselors')
          .select('*, profiles(*)')
          .eq('is_active', true)
          .order('rating_average', { ascending: false })
        if (cancelled) return
        if (error || !data || data.length === 0) return
        setCounselors(data as CounselorRow[])
      } catch {
        // keep mock fallback
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]

  const methodologyGroups = useMemo(() => groupMethodologies(METHODOLOGIES), [])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return counselors.filter((c) => {
      const name: string =
        c?.profiles?.display_name || c?.profiles?.full_name || ''
      const bio: string = c?.bio || ''
      if (kw && !name.toLowerCase().includes(kw) && !bio.toLowerCase().includes(kw)) return false

      if (selectedConcerns.length > 0) {
        const concerns: string[] = Array.isArray(c?.concerns)
          ? c.concerns
          : Array.isArray(c?.specialties)
            ? c.specialties
            : []
        const concernLabels = selectedConcerns.map(
          (slug) => CONCERNS.find((x) => x.slug === slug)?.label || slug,
        )
        const hit = concerns.some(
          (v: string) => selectedConcerns.includes(v) || concernLabels.includes(v),
        )
        if (!hit) return false
      }

      if (selectedMethodologies.length > 0) {
        const methods: string[] = Array.isArray(c?.methodology) ? c.methodology : []
        const methodLabels = selectedMethodologies.map(
          (slug) => METHODOLOGIES.find((m) => m.slug === slug)?.label || slug,
        )
        const hit = methods.some(
          (v: string) => selectedMethodologies.includes(v) || methodLabels.includes(v),
        )
        if (!hit) return false
      }

      if (onlineOnlyFilter && c?.availability_mode !== 'machiuke') return false

      return true
    })
  }, [counselors, keyword, selectedConcerns, selectedMethodologies, onlineOnlyFilter])

  const clearAll = () => {
    setSelectedConcerns([])
    setSelectedMethodologies([])
    setOnlineOnlyFilter(false)
    setKeyword('')
  }

  const activeFilterCount =
    selectedConcerns.length +
    selectedMethodologies.length +
    (onlineOnlyFilter ? 1 : 0) +
    (keyword.trim() ? 1 : 0)

  const Checkbox = ({
    checked,
    onChange,
    label,
  }: {
    checked: boolean
    onChange: () => void
    label: string
  }) => (
    <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span className="leading-snug">{label}</span>
    </label>
  )

  const FiltersPanel = (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block text-sm font-medium text-gray-700">キーワード検索</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="名前・自己紹介..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <Label htmlFor="online-now" className="text-sm font-medium text-gray-800 cursor-pointer">
            今すぐ話せる人のみ
          </Label>
        </div>
        <input
          id="online-now"
          type="checkbox"
          checked={onlineOnlyFilter}
          onChange={() => setOnlineOnlyFilter((v) => !v)}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Compass className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-gray-800">悩みで絞り込む</h3>
        </div>
        <div className="space-y-0.5">
          {CONCERNS.map((c) => (
            <Checkbox
              key={c.slug}
              checked={selectedConcerns.includes(c.slug)}
              onChange={() => setSelectedConcerns((s) => toggle(s, c.slug))}
              label={c.label}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-gray-800">アプローチで絞り込む</h3>
        </div>
        {(
          [
            ['ホリスティック', methodologyGroups.holistic],
            ['スピリチュアル', methodologyGroups.spiritual],
            ['占術', methodologyGroups.divination],
          ] as const
        ).map(([title, items]) => (
          <div key={title} className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
            <div className="space-y-0.5">
              {items.map((m) => (
                <Checkbox
                  key={m.slug}
                  checked={selectedMethodologies.includes(m.slug)}
                  onChange={() => setSelectedMethodologies((s) => toggle(s, m.slug))}
                  label={m.label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearAll} className="w-full">
          <X className="mr-1 h-4 w-4" />
          フィルターをクリア ({activeFilterCount})
        </Button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">スピリチュアルカウンセラーを探す</h1>
          <p className="mt-2 text-gray-500">{filtered.length}名のカウンセラー</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal className="mr-1 h-4 w-4" />
          フィルター{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <Card className="lg:sticky lg:top-20">
              <CardContent className="p-5">{FiltersPanel}</CardContent>
            </Card>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-gray-500">
                <p className="mb-3">条件に合うカウンセラーが見つかりませんでした</p>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  フィルターをリセット
                </Button>
              </CardContent>
            </Card>
          ) : (
            filtered.map((counselor) => (
              <CounselorCard key={counselor.id} counselor={counselor} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
