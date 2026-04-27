import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip auth check if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 認証が必要な領域（dashboard / 認証済み API）のみ保護。それ以外は全て public。
  const pathname = request.nextUrl.pathname
  // 例外: 内部 API で SUPABASE_SERVICE_ROLE_KEY による独自トークン認証を使うエンドポイント
  const apiAllowList = [
    '/api/admin/landing/generate-hero-once',
  ]
  const isApiAllowed = apiAllowList.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const isProtected = !isApiAllowed && (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/session') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/counselor') ||
    pathname.startsWith('/api/wallet')
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
