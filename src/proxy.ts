import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// ログインしていなくてもアクセスできるページ
const PUBLIC_PATHS = ['/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null
  const isLoggedIn = session !== null

  // ログイン済みで /login にアクセスしたら / へリダイレクト
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 未ログインで保護されたページにアクセスしたら /login へリダイレクト
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // API・静的ファイル・画像最適化を除いた全パスに適用
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
