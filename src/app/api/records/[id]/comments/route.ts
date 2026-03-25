// src/app/api/records/[id]/comments/route.ts
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// POST /api/records/:id/comments — コメントを投稿する
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) return Response.json({ error: 'ログインしていません' }, { status: 401 })
    const session = await verifySession(token)
    if (!session) return Response.json({ error: 'セッションが無効です' }, { status: 401 })

    const { id: recordId } = await params
    const body = await request.json()

    if (!body.body || body.body.trim() === '') {
      return Response.json({ error: 'コメントを入力してください' }, { status: 400 })
    }

    const [comment] = await sql`
      INSERT INTO comments (record_id, user_id, body)
      VALUES (${recordId}, ${session.userId}, ${body.body.trim()})
      RETURNING id, body, created_at
    `

    return Response.json({ ok: true, comment }, { status: 201 })
  } catch {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}
