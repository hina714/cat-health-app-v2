import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// DELETE /api/cats/[id] — 自分の猫を削除する
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // user_id も条件に含めることで、他人の猫は削除できないようにする
    const [deleted] = await sql`
      DELETE FROM cats
      WHERE id = ${id} AND user_id = ${session.userId}
      RETURNING id
    `

    if (!deleted) {
      return Response.json({ error: '見つかりませんでした' }, { status: 404 })
    }

    return Response.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[DELETE /api/cats/:id]', message)
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}
