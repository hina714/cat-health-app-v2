// src/app/api/test/route.ts
import { sql } from '@/lib/db'

// GET /api/test — testテーブルの全件取得
export async function GET() {
  const rows = await sql`SELECT * FROM test`
  return Response.json({ ok: true, rows })
}

// POST /api/test — testテーブルにレコードを作成
export async function POST(request: Request) {
  // リクエストのボディ（送られてきたデータ）をJSON形式で受け取る
  const body = await request.json()

  // 入力チェック：message がなければエラーを返す
  if (!body.message) {
    return Response.json({ error: 'message は必須です' }, { status: 400 })
  }

  // DBにレコードを作成し、作成されたデータを返す
  const [row] = await sql`
    INSERT INTO test (message)
    VALUES (${body.message})
    RETURNING *
  `

  // 作成成功（201）とともに作成されたデータを返す
  return Response.json({ ok: true, row }, { status: 201 })
}