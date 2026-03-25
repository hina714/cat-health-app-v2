// scripts/seed-household.mjs
// 家族（household）を登録するスクリプト
// 使い方: node --env-file=.env.local scripts/seed-household.mjs <household_name>
// 例:     node --env-file=.env.local scripts/seed-household.mjs 青木家

import postgres from 'postgres'

const [householdName] = process.argv.slice(2)

if (!householdName) {
  console.error('使い方: node scripts/seed-household.mjs <household_name>')
  console.error('例:     node scripts/seed-household.mjs 青木家')
  process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL)

try {
  const [household] = await sql`
    INSERT INTO households (name)
    VALUES (${householdName})
    RETURNING id, name, created_at
  `
  console.log('家族を登録しました:', household)
  console.log('\n次のステップ:')
  console.log(`  node --env-file=.env.local scripts/create-user.mjs <username> <password> ${household.id}`)
} catch (err) {
  console.error('エラー:', err.message)
  process.exit(1)
} finally {
  await sql.end()
}
