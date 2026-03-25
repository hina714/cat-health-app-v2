import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await verifySession(token)
  return session?.userId ?? null
}

// GET /api/cats
export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'ログインしていません' }, { status: 401 })
    }

    const cats = await sql`
      SELECT id, name, icon_data, breed, birthdate, neutered, created_at
      FROM cats
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `
    return Response.json({ ok: true, cats })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[GET /api/cats]', message)
    return Response.json({ error: 'Server Error', detail: message }, { status: 500 })
  }
}
