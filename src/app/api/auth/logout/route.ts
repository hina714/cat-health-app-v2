// src/app/api/auth/logout/route.ts
import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/session'

// POST /api/auth/logout — ログアウト
export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)

  return Response.json({ ok: true })
}
