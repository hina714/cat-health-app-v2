// scripts/seed-cat.mjs
// 猫のデータを手動登録するスクリプト
// 使い方: node --env-file=.env.local scripts/seed-cat.mjs <username> <cat_name> [breed] [birthdate]
// 使い方: node --env-file=.env.local scripts/seed-cat.mjs <name> [breed] [birthdate]
// 例:     node --env-file=.env.local scripts/seed-cat.mjs たま 三毛猫 2022-04-01

import postgres from 'postgres'

const [name, breed, birthdate] = process.argv.slice(2)

if (!name) {
  console.error('使い方: node scripts/seed-cat.mjs <name> [breed] [birthdate]')
  process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL)

try {
  const [cat] = await sql`
    INSERT INTO cats (name, breed, birthdate)
    VALUES (${name}, ${breed ?? null}, ${birthdate ?? null})
    RETURNING id, name, breed, birthdate, created_at
  `
  console.log('猫を登録しました:', cat)
} catch (err) {
  console.error('エラー:', err.message)
  process.exit(1)
} finally {
  await sql.end()
}
