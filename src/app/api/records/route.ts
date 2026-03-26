// src/app/api/records/route.ts
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// GET /api/records — 全記録を新しい順で返す（ユーザー名・コメント付き）
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) return Response.json({ error: 'ログインしていません' }, { status: 401 })
    const session = await verifySession(token)
    if (!session) return Response.json({ error: 'セッションが無効です' }, { status: 401 })

    const records = await sql`
      SELECT
        r.id, r.weight, r.food_amount, r.excretion, r.condition, r.memo, r.created_at,
        r.user_id,
        u.username
      FROM records r
      JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at DESC
    `

    return Response.json({ ok: true, records })
  } catch {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}

// POST /api/records — 記録を新規作成する
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) return Response.json({ error: 'ログインしていません' }, { status: 401 })
    const session = await verifySession(token)
    if (!session) return Response.json({ error: 'セッションが無効です' }, { status: 401 })

    const body = await request.json()

    const [record] = await sql`
      INSERT INTO records (user_id, weight, food_amount, excretion, condition, memo)
      VALUES (
        ${session.userId},
        ${body.weight ?? null},
        ${body.food_amount ?? null},
        ${body.excretion ?? null},
        ${body.condition ?? null},
        ${body.memo ?? null}
      )
      RETURNING id, weight, food_amount, excretion, condition, memo, created_at
    `

    return Response.json({ ok: true, record }, { status: 201 })
  } catch {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}
