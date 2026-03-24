import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// セッションからユーザーIDを取得するヘルパー
async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await verifySession(token)
  return session?.userId ?? null
}

// GET /api/cats — ログイン中のユーザーの猫一覧を返す
export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'ログインしていません' }, { status: 401 })
    }

    const cats = await sql`
      SELECT id, name, icon_data, breed, birthdate, created_at
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

// POST /api/cats — 猫を登録する
export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'ログインしていません' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return Response.json({ error: '名前は必須です' }, { status: 400 })
    }

    const [cat] = await sql`
      INSERT INTO cats (user_id, name, icon_data, breed, birthdate)
      VALUES (
        ${userId},
        ${body.name.trim()},
        ${body.icon_data ?? null},
        ${body.breed?.trim() || null},
        ${body.birthdate || null}
      )
      RETURNING id, name, icon_data, breed, birthdate, created_at
    `

    return Response.json({ ok: true, cat }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[POST /api/cats]', message)
    return Response.json({ error: 'Server Error', detail: message }, { status: 500 })
  }
}
