// src/app/api/cats/route.ts
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// GET /api/cats — 全ての猫を返す（家族全員で共有）
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) {
      return Response.json({ error: 'ログインしていません' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return Response.json({ error: 'セッションが無効です' }, { status: 401 })
    }

    const cats = await sql`
      SELECT id, name, icon_data, breed, birthdate, neutered, created_at
      FROM cats
      ORDER BY created_at ASC
    `

    return Response.json({ ok: true, cats })
  } catch {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}
