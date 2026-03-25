import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// セッションのユーザーIDから household_id を取得するヘルパー
async function getHouseholdId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await verifySession(token)
  if (!session) return null
  const [user] = await sql`SELECT household_id FROM users WHERE id = ${session.userId}`
  return user?.household_id ?? null
}

// GET /api/cats — ログイン中のユーザーの家族（household）に紐づく猫を返す
export async function GET() {
  try {
    const householdId = await getHouseholdId()
    if (!householdId) {
      return Response.json({ error: 'ログインしていません' }, { status: 401 })
    }

    const cats = await sql`
      SELECT id, name, icon_data, breed, birthdate, neutered, created_at
      FROM cats
      WHERE household_id = ${householdId}
      ORDER BY created_at ASC
    `

    return Response.json({ ok: true, cats })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[GET /api/cats]', message)
    return Response.json({ error: 'Server Error', detail: message }, { status: 500 })
  }
}
