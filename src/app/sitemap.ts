import { MetadataRoute } from "next"
import { createClient as createAdmin } from "@supabase/supabase-js"

const STATIC_PATHS: string[] = [
  "/",
  "/counselors",
  "/columns",
  "/about",
  "/login",
  "/signup",
  "/legal/terms",
  "/legal/privacy",
  "/legal/commerce",
]

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createAdmin(url, key, { auth: { persistSession: false } })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1.0 : 0.7,
  }))

  const admin = getAdmin()
  if (!admin) return entries

  // 公開中カウンセラー
  const { data: counselors } = await admin
    .from("counselors")
    .select("id, updated_at")
    .eq("is_active", true)
  for (const c of counselors ?? []) {
    entries.push({
      url: `${base}/counselors/${c.id}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  }

  // 公開中コラム
  const { data: columns } = await admin
    .from("columns")
    .select("slug, published_at, updated_at")
    .not("published_at", "is", null)
  for (const col of columns ?? []) {
    entries.push({
      url: `${base}/columns/${col.slug}`,
      lastModified: col.updated_at ? new Date(col.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }

  // noindex 指定された path は除外
  const { data: noindexRows } = await admin
    .from("site_seo")
    .select("page_path")
    .eq("noindex", true)
  const noindexSet = new Set((noindexRows ?? []).map((r) => r.page_path))
  return entries.filter((e) => {
    const path = e.url.replace(base, "")
    return !noindexSet.has(path)
  })
}
