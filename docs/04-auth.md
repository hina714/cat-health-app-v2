# JWT認証の追加方法

username + password によるログイン機能を、**JWT**（JSON Web Token）と **HttpOnly Cookie** を使って実装する手順です。

> **JWT**（JSON Web Token）とは、ユーザー情報を暗号化してURLやCookieに入れて運ぶための仕組みです。
> **HttpOnly Cookie** とは、JavaScriptからはアクセスできず、ブラウザがHTTPリクエスト時だけ自動で送る安全なCookieです。

---

## 全体の流れ

```
[ブラウザ]
    │ POST /api/auth/login { username, password }
    ▼
[login/route.ts]
    │ パスワード照合 → JWT生成 → Set-Cookie: session=<JWT>; HttpOnly
    ▼
[ブラウザ] ← CookieにJWTを保持

    │ POST /api/cats { name: "たま" }  ← Cookieが自動送信される
    ▼
[cats/route.ts]
    │ CookieのJWTを検証 → user_idを取り出す
    │ INSERT INTO cats (user_id = userId, ...)
    ▼
[レスポンス] { ok: true, cat: {...} }
```

---

## Step 1: パッケージをインストール

```bash
npm install jose bcryptjs
npm install --save-dev @types/bcryptjs
```

| パッケージ | 用途 |
|---|---|
| `jose` | JWTの生成・検証 |
| `bcryptjs` | パスワードのハッシュ化（元に戻せない暗号化） |

---

## Step 2: 環境変数を追加

`.env.local` に追記します。

```
SESSION_SECRET=<32文字以上のランダムな文字列>
```

シークレットキーはターミナルで生成できます：

```bash
openssl rand -base64 32
```

> **シークレットキー** とは、JWTの署名に使う秘密の文字列です。これが漏れると他人がJWTを偽造できるため、`.env.local` に保存してGitにコミットしません。

---

## Step 3: SQLファイルを作成・実行

`sql/20260323_003_create_users.sql` を作成します。

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

このファイルを Supabase の SQL Editor に貼り付けて実行します。

> パスワードをそのままDBに保存するのは危険なので、`password_hash` カラムにはハッシュ化した値を保存します。

---

## Step 4: src/lib/session.ts を作成

JWTの生成・検証ロジックをまとめたファイルです。

```typescript
import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'session'

export type SessionPayload = {
  userId: string
  username: string
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET が設定されていません')
  return new TextEncoder().encode(secret)
}

// JWTを生成する（有効期限7日）
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

// JWTを検証する（失敗時はnullを返す）
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    }
  } catch {
    return null
  }
}
```

---

## Step 5: POST /api/auth/register を作成

`src/app/api/auth/register/route.ts`

```typescript
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.username) {
    return Response.json({ error: 'username は必須です' }, { status: 400 })
  }
  if (!body.password || body.password.length < 8) {
    return Response.json({ error: 'password は8文字以上必須です' }, { status: 400 })
  }

  // パスワードをハッシュ化してDBに保存
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
```

---

## Step 6: POST /api/auth/login を作成

`src/app/api/auth/login/route.ts`

```typescript
import { compare } from 'bcryptjs'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { signSession, SESSION_COOKIE } from '@/lib/session'

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.username || !body.password) {
    return Response.json({ error: 'username と password は必須です' }, { status: 400 })
  }

  const [user] = await sql`
    SELECT id, username, password_hash FROM users WHERE username = ${body.username}
  `

  // ユーザーが存在しない・パスワードが違う場合は同じエラーにする
  // （どちらが間違いか教えないことでセキュリティを高める）
  if (!user) {
    return Response.json({ error: 'username または password が違います' }, { status: 401 })
  }

  const passwordMatch = await compare(body.password, user.password_hash)
  if (!passwordMatch) {
    return Response.json({ error: 'username または password が違います' }, { status: 401 })
  }

  // JWTを生成してCookieにセット
  const token = await signSession({ userId: user.id, username: user.username })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7日間
  })

  return Response.json({ ok: true, user: { id: user.id, username: user.username } })
}
```

---

## Step 7: GET /api/auth/me を作成

`src/app/api/auth/me/route.ts`

```typescript
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return Response.json({ error: 'ログインしていません' }, { status: 401 })
  }

  const session = await verifySession(token)
  if (!session) {
    return Response.json({ error: 'セッションが無効です' }, { status: 401 })
  }

  return Response.json({ ok: true, user: { id: session.userId, username: session.username } })
}
```

---

## Step 8: POST /api/cats を修正

body からの `user_id` 受け取りを削除し、Cookie のセッションから取得するよう変更します。

```typescript
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

export async function POST(request: Request) {
  // Cookieのセッションからuser_idを取得
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return Response.json({ error: 'ログインしていません' }, { status: 401 })
  }

  const session = await verifySession(token)
  if (!session) {
    return Response.json({ error: 'セッションが無効です' }, { status: 401 })
  }

  const body = await request.json()

  if (!body.name) {
    return Response.json({ error: 'name は必須です' }, { status: 400 })
  }

  const [cat] = await sql`
    INSERT INTO cats (user_id, name, breed, birth_date)
    VALUES (${session.userId}, ${body.name}, ${body.breed ?? null}, ${body.birth_date ?? null})
    RETURNING *
  `

  return Response.json({ ok: true, cat }, { status: 201 })
}
```

---

## 動作確認

```bash
# 1. ユーザー登録
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 2. ログイン（cookie.txt にCookieを保存）
curl -c cookie.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 3. ログイン中のユーザー確認
curl -b cookie.txt http://localhost:3000/api/auth/me

# 4. 猫を登録（user_idなし・Cookieで認証）
curl -b cookie.txt -X POST http://localhost:3000/api/cats \
  -H "Content-Type: application/json" \
  -d '{"name":"たま"}'
```

---

## レスポンス仕様

| エンドポイント | メソッド | 成功時 | エラー時 |
|---|---|---|---|
| `/api/auth/register` | POST | 201 `{ ok, user }` | 400（入力不足）/ 409（username重複） |
| `/api/auth/login` | POST | 200 `{ ok, user }` + Cookie | 401（認証失敗） |
| `/api/auth/me` | GET | 200 `{ ok, user }` | 401（未ログイン） |
| `/api/cats` | POST | 201 `{ ok, cat }` | 401（未ログイン）/ 400（name不足） |

---

## チェックリスト

- [ ] `npm install jose bcryptjs` を実行した
- [ ] `.env.local` に `SESSION_SECRET` を追加した
- [ ] Supabase で `users` テーブルを作成した
- [ ] `src/lib/session.ts` を作成した
- [ ] `src/app/api/auth/register/route.ts` を作成した
- [ ] `src/app/api/auth/login/route.ts` を作成した
- [ ] `src/app/api/auth/me/route.ts` を作成した
- [ ] `src/app/api/cats/route.ts` の POST を修正した
- [ ] curl で動作確認した
