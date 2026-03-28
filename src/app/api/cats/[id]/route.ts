// src/app/api/cats/[id]/route.ts
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

// PATCH /api/cats/:id — アイコン画像を更新する
export async function PATCH(
  request: Request,
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
    const body = await request.json()

    const [cat] = await sql`
      UPDATE cats
      SET icon_data = ${body.icon_data ?? null}
      WHERE id = ${id}
      RETURNING id, name, icon_data
    `

    if (!cat) {
      return Response.json({ error: '猫が見つかりません' }, { status: 404 })
    }

    return Response.json({ ok: true, cat })
  } catch {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}
