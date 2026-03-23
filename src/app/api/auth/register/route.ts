// src/app/api/auth/register/route.ts
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'

// POST /api/auth/register — ユーザー登録
export async function POST(request: Request) {
  const body = await request.json()

  // バリデーション（入力チェック）
  if (!body.username) {
    return Response.json({ error: 'username は必須です' }, { status: 400 })
  }
  if (!body.password || body.password.length < 8) {
    return Response.json({ error: 'password は8文字以上必須です' }, { status: 400 })
  }

  // パスワードをハッシュ化（元の文字列に戻せない形に変換）してDBに保存
  const passwordHash = await hash(body.password, 10)

  try {
    const [user] = await sql`
      INSERT INTO users (username, password_hash)
      VALUES (${body.username}, ${passwordHash})
      RETURNING id, username, created_at
    `
    return Response.json({ ok: true, user }, { status: 201 })
  } catch (err: unknown) {
    // username が重複している場合（PostgreSQLのエラーコード 23505）
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === '23505'
    ) {
      return Response.json({ error: 'そのユーザー名はすでに使われています' }, { status: 409 })
    }
    throw err
  }
}
