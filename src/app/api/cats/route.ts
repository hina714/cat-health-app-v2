// src/app/api/cats/route.ts
import { sql } from '@/lib/db'

// GET /api/cats — 全件取得
export async function GET() {
  const cats = await sql`SELECT * FROM cats ORDER BY created_at DESC`
  return Response.json({ ok: true, cats })
}

// POST /api/cats — 新規作成
export async function POST(request: Request) {
  const body = await request.json()

  // 入力チェック
  if (!body.name) {
    return Response.json({ error: 'name は必須です' }, { status: 400 })
  }
  // TODO: 認証実装後は session からuser_idを取得する
  if (!body.user_id) {
    return Response.json({ error: 'user_id は必須です' }, { status: 400 })
  }

  const [cat] = await sql`
    INSERT INTO cats (user_id, name, breed, birth_date)
    VALUES (${body.user_id}, ${body.name}, ${body.breed ?? null}, ${body.birth_date ?? null})
    RETURNING *
  `

  return Response.json({ ok: true, cat }, { status: 201 })
}
