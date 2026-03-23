// src/app/api/cats/route.ts
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// GET /api/cats — 全件取得
export async function GET() {
  const cats = await sql`SELECT * FROM cats ORDER BY created_at DESC`
  return Response.json({ ok: true, cats })
}

// POST /api/cats — 新規作成
export async function POST(request: Request) {
  // Cookieのセッションからuser_idを取得する
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return Response.json({ error: 'ログインしていません' }, { status: 401 })
  }

  const session = await verifySession(token)
  if (!session) {
    return Response.json({ error: 'セッションが無効です' }, { status: 401 })
  }

  const body = await request.json()

  // 入力チェック
  if (!body.name) {
    return Response.json({ error: 'name は必須です' }, { status: 400 })
  }

  const [cat] = await sql`
    INSERT INTO cats (user_id, name, breed, birth_date)
    VALUES (${session.userId}, ${body.name}, ${body.breed ?? null}, ${body.birth_date ?? null})
    RETURNING *
  `

  return Response.json({ ok: true, cat }, { status: 201 })
}
