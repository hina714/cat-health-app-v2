# APIルートの追加方法

Next.js の **Route Handlers** を使って API エンドポイントを作ります。
`src/app/api/` 以下に `route.ts` ファイルを置くだけで API になります。

---

## 基本ルール

| ファイルパス | URLパス | 用途 |
|---|---|---|
| `app/api/cats/route.ts` | `/api/cats` | 一覧取得・新規作成 |
| `app/api/cats/[id]/route.ts` | `/api/cats/123` | 1件取得・更新・削除 |

- `route.ts` と同じ階層に `page.tsx` を置いてはいけません
- HTTP メソッド（GET, POST など）ごとに関数を export します

---

## 1. 一覧取得・新規作成 API

`src/app/api/cats/route.ts` を作成します。

```typescript
// src/app/api/cats/route.ts
import { db } from '@/lib/db'

// GET /api/cats — 全件取得
export async function GET() {
  const cats = db.prepare('SELECT * FROM cats ORDER BY created_at DESC').all()
  return Response.json(cats)
}

// POST /api/cats — 新規作成
export async function POST(request: Request) {
  const body = await request.json()

  // 入力チェック
  if (!body.name) {
    return Response.json({ error: '名前は必須です' }, { status: 400 })
  }

  const stmt = db.prepare(`
    INSERT INTO cats (name, breed, birth_date)
    VALUES (?, ?, ?)
  `)
  const result = stmt.run(body.name, body.breed ?? null, body.birth_date ?? null)

  const newCat = db.prepare('SELECT * FROM cats WHERE id = ?').get(result.lastInsertRowid)
  return Response.json(newCat, { status: 201 })
}
```

---

## 2. 1件取得・更新・削除 API

`src/app/api/cats/[id]/route.ts` を作成します。

```typescript
// src/app/api/cats/[id]/route.ts
import { db } from '@/lib/db'

// GET /api/cats/123 — 1件取得
export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/cats/[id]'>
) {
  const { id } = await ctx.params
  const cat = db.prepare('SELECT * FROM cats WHERE id = ?').get(id)

  if (!cat) {
    return Response.json({ error: '見つかりません' }, { status: 404 })
  }

  return Response.json(cat)
}

// PATCH /api/cats/123 — 更新
export async function PATCH(
  request: Request,
  ctx: RouteContext<'/api/cats/[id]'>
) {
  const { id } = await ctx.params
  const body = await request.json()

  db.prepare(`
    UPDATE cats SET name = ?, breed = ?, birth_date = ? WHERE id = ?
  `).run(body.name, body.breed ?? null, body.birth_date ?? null, id)

  const updated = db.prepare('SELECT * FROM cats WHERE id = ?').get(id)
  return Response.json(updated)
}

// DELETE /api/cats/123 — 削除
export async function DELETE(
  _request: Request,
  ctx: RouteContext<'/api/cats/[id]'>
) {
  const { id } = await ctx.params

  db.prepare('DELETE FROM cats WHERE id = ?').run(id)
  return new Response(null, { status: 204 })
}
```

---

## 3. APIをブラウザで確認する

開発サーバーを起動してブラウザや curl でアクセスします。

```bash
npm run dev
```

```bash
# 全件取得
curl http://localhost:3000/api/cats

# 新規作成
curl -X POST http://localhost:3000/api/cats \
  -H "Content-Type: application/json" \
  -d '{"name": "たま", "breed": "三毛猫"}'
```

---

## レスポンスのステータスコード

| コード | 意味 | 使いどころ |
|---|---|---|
| 200 | OK | 通常の成功（GET, PATCH） |
| 201 | Created | 作成成功（POST） |
| 204 | No Content | 削除成功（DELETE） |
| 400 | Bad Request | 入力値エラー |
| 404 | Not Found | 対象が存在しない |
| 500 | Server Error | サーバー側のエラー |

---

## チェックリスト

- [ ] `src/app/api/cats/route.ts` を作成した（GET, POST）
- [ ] `src/app/api/cats/[id]/route.ts` を作成した（GET, PATCH, DELETE）
- [ ] `npm run dev` でAPIにアクセスして動作確認した
