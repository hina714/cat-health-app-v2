// src/app/api/test/route.ts
import { sql } from '@/lib/db'

// GET /api/test — Supabase への接続確認
export async function GET() {
    // testテーブルの全件を取得する
    const rows = await sql`SELECT * FROM test`

    // 取得したデータをJSON形式で返す
    return Response.json({ ok: true, rows })
}