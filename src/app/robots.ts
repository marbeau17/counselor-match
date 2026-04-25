import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  // 本番以外は基本的に検索除外
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"
  if (!isProduction || process.env.NEXT_PUBLIC_NOINDEX === "true") {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/login", "/signup"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
