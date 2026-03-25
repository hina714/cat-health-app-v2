// scripts/create-user.mjs
// ローカルでユーザーを手動登録するスクリプト
// 使い方: node --env-file=.env.local scripts/create-user.mjs <username> <password> <household_id>

import { hash } from 'bcryptjs'
import postgres from 'postgres'

const [username, password, householdId] = process.argv.slice(2)

if (!username || !password || !householdId) {
  console.error('使い方: node scripts/create-user.mjs <username> <password> <household_id>')
  process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL)

try {
  const passwordHash = await hash(password, 12)
  const [user] = await sql`
    INSERT INTO users (username, password_hash, household_id)
    VALUES (${username}, ${passwordHash}, ${householdId})
    RETURNING id, username, household_id, created_at
  `
  console.log('ユーザーを作成しました:', user)
} catch (err) {
  if (err.code === '23505') {
    console.error(`エラー: ユーザー名 "${username}" はすでに存在します`)
  } else {
    console.error('エラー:', err.message)
  }
  process.exit(1)
} finally {
  await sql.end()
}
