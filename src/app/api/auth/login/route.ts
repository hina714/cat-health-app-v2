// src/app/api/auth/login/route.ts
import { compare } from 'bcryptjs'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { signSession, SESSION_COOKIE } from '@/lib/session'

// POST /api/auth/login — ログイン
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.username || !body.password) {
      return Response.json({ error: 'username と password は必須です' }, { status: 400 })
    }

    // DBからユーザーを取得
    const [user] = await sql`
      SELECT id, username, password_hash FROM users WHERE username = ${body.username}
    `

    // ユーザーが存在しない、またはパスワードが違う場合は同じエラーを返す
    // （どちらが間違いか教えないことでセキュリティを高める）
    if (!user) {
      return Response.json(
        { error: 'username または password が違います' },
        { status: 401 }
      )
    }

    const passwordMatch = await compare(body.password, user.password_hash)
    if (!passwordMatch) {
      return Response.json(
        { error: 'username または password が違います' },
        { status: 401 }
      )
    }

    // JWTを生成してHttpOnly Cookieにセット
    const token = await signSession({ userId: user.id })
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    })

    return Response.json({ ok: true, user: { id: user.id, username: user.username } })
  } catch (e) {
    return Response.json({ error: 'Server Error' }, { status: 500 })
  }
}
