// src/app/api/records/[id]/route.ts
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// PATCH /api/records/:id — 記録を更新する（書いた本人のみ）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) return Response.json({ error: 'ログインしていません' }, { status: 401 })
    const session = await verifySession(token)
    if (!session) return Response.json({ error: 'セッションが無効です' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    // user_id で書いた本人かどうかチェック（認可）
    const [record] = await sql`
      UPDATE records
      SET
        weight      = ${body.weight ?? null},
        food_amount = ${body.food_amount ?? null},
        excretion   = ${body.excretion ?? null},
        condition   = ${body.condition ?? null},
        memo        = ${body.memo ?? null}
      WHERE id = ${id}
        AND user_id = ${session.userId}
      RETURNING id, weight, food_amount, excretion, condition, memo, created_at
    `

    if (!record) return Response.json({ error: '記録が見つかりません' }, { status: 404 })

    return Response.json({ ok: true, record })
  } catch {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}

// DELETE /api/records/:id — 記録を削除する（書いた本人のみ）
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) return Response.json({ error: 'ログインしていません' }, { status: 401 })
    const session = await verifySession(token)
    if (!session) return Response.json({ error: 'セッションが無効です' }, { status: 401 })

    const { id } = await params

    const [deleted] = await sql`
      DELETE FROM records
      WHERE id = ${id}
        AND user_id = ${session.userId}
      RETURNING id
    `

    if (!deleted) return Response.json({ error: '記録が見つかりません' }, { status: 404 })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}
