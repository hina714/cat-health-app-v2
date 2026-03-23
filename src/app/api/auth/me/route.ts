// src/app/api/auth/me/route.ts
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// GET /api/auth/me — ログイン中のユーザー情報を返す
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return Response.json({ error: 'ログインしていません' }, { status: 401 })
  }

  const session = await verifySession(token)
  if (!session) {
    return Response.json({ error: 'セッションが無効です' }, { status: 401 })
  }

  return Response.json({ ok: true, user: { id: session.userId, username: session.username } })
}
