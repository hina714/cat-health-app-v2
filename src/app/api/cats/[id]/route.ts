// src/app/api/cats/[id]/route.ts
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/cats/123 — 1件取得
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/cats/[id]'>) {
  const { id } = await ctx.params

  const [cat] = await sql`SELECT * FROM cats WHERE id = ${id}`

  if (!cat) {
    return Response.json({ error: '見つかりません' }, { status: 404 })
  }

  return Response.json({ ok: true, cat })
}

// PATCH /api/cats/123 — 更新
export async function PATCH(request: Request, ctx: RouteContext<'/api/cats/[id]'>) {
  const { id } = await ctx.params
  const body = await request.json()

  const [cat] = await sql`
    UPDATE cats
    SET
      name       = COALESCE(${body.name ?? null}, name),
      breed      = COALESCE(${body.breed ?? null}, breed),
      birth_date = COALESCE(${body.birth_date ?? null}, birth_date)
    WHERE id = ${id}
    RETURNING *
  `

  if (!cat) {
    return Response.json({ error: '見つかりません' }, { status: 404 })
  }

  return Response.json({ ok: true, cat })
}

// DELETE /api/cats/123 — 削除
export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/cats/[id]'>) {
  const { id } = await ctx.params

  const [cat] = await sql`DELETE FROM cats WHERE id = ${id} RETURNING id`

  if (!cat) {
    return Response.json({ error: '見つかりません' }, { status: 404 })
  }

  return new Response(null, { status: 204 })
}
