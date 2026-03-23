import postgres from 'postgres'

// .env.local の DATABASE_URL を読み込む
const connectionString = process.env.DATABASE_URL!

// 開発時にホットリロード（ファイル保存のたびにサーバーが再起動する機能）で
// DB接続が何度も作られないようにグローバルに保持する
const globalForSql = globalThis as unknown as { sql: postgres.Sql }

export const sql = globalForSql.sql ?? postgres(connectionString)

if (process.env.NODE_ENV !== 'production') {
  globalForSql.sql = sql
}
