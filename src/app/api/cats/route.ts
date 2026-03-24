import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// GET /api/cats — ログイン中のユーザーの猫一覧を返す
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
      SELECT id, name, icon_data, breed, birthdate, created_at
      FROM cats
      WHERE user_id = ${session.userId}
      ORDER BY created_at ASC
    `

    return Response.json({ ok: true, cats })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[GET /api/cats]', message)
    return Response.json({ error: 'Server Error', detail: message }, { status: 500 })
  }
}
