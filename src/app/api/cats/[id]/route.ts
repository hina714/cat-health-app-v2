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

// PATCH /api/cats/[id] — 自分の猫の情報を更新する
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'ログインしていません' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return Response.json({ error: '名前は必須です' }, { status: 400 })
    }

    // user_id も条件に含めることで、他人の猫は更新できないようにする
    // neutered: "true" → true、"false" → false、それ以外（"unknown" など）→ null
    const neutered =
      body.neutered === 'true' ? true : body.neutered === 'false' ? false : null

    const [cat] = await sql`
      UPDATE cats
      SET
        name      = ${body.name.trim()},
        icon_data = ${body.icon_data ?? null},
        breed     = ${body.breed?.trim() || null},
        birthdate = ${body.birthdate || null},
        neutered  = ${neutered}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, name, icon_data, breed, birthdate, neutered, created_at
    `

    if (!cat) {
      return Response.json({ error: '見つかりませんでした' }, { status: 404 })
    }

    return Response.json({ ok: true, cat })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[PATCH /api/cats/:id]', message)
    return Response.json({ error: 'Server Error', detail: message }, { status: 500 })
  }
}
