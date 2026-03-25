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

// PATCH /api/cats/[id] — 家族（household）の猫のプロフィールを更新する
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const householdId = await getHouseholdId()
    if (!householdId) {
      return Response.json({ error: 'ログインしていません' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return Response.json({ error: '名前は必須です' }, { status: 400 })
    }

    const neutered =
      body.neutered === 'true' ? true : body.neutered === 'false' ? false : null

    // household_id も条件に含めることで、他の家族の猫は更新できないようにする
    const [cat] = await sql`
      UPDATE cats
      SET
        name      = ${body.name.trim()},
        icon_data = ${body.icon_data ?? null},
        breed     = ${body.breed?.trim() || null},
        birthdate = ${body.birthdate || null},
        neutered  = ${neutered}
      WHERE id = ${id} AND household_id = ${householdId}
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
