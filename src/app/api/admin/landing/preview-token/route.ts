import { NextRequest, NextResponse } from "next/server"
import { requireAdminForApi } from "@/lib/admin"
import { issuePreviewToken } from "@/lib/preview-token"

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const pageKey = String(body.page_key ?? "home")
  try {
    const token = issuePreviewToken(pageKey)
    return NextResponse.json({ token })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 })
  }
}
