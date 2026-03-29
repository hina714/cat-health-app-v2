import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import styles from './page.module.css'
import HealthChart from '@/app/records/HealthChart'

export const metadata: Metadata = { title: '健康グラフ | 猫の健康ノート' }

type Record = {
  id: string
  username: string
  weight: string | null
  food_amount: string | null
  excretion: string | null
  condition: string | null
  created_at: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default async function GraphPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect('/login')

  const records: Record[] = await sql`
    SELECT r.id, r.weight, r.food_amount, r.excretion, r.condition, r.created_at,
           u.username
    FROM records r
    JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
  `

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.backLink}>← トップへ戻る</Link>
      <div className={styles.header}>
        <h1 className={styles.title}>健康グラフ</h1>
        <Link href="/records/new" className={styles.btnNew}>＋ 記録する</Link>
      </div>

      {records.length < 2 ? (
        <div className={styles.emptyBox}>
          <span className={styles.emptyIcon}>📊</span>
          <p className={styles.empty}>グラフを表示するには2件以上の記録が必要です</p>
          <Link href="/records/new" className={styles.btnNew}>最初の記録をつける</Link>
        </div>
      ) : (
        <>
          <div className={styles.chartBox}>
            <HealthChart
              data={records.map((r) => ({
                date: r.created_at,
                weight: r.weight ? Number(r.weight) : null,
                food_amount: r.food_amount ? Number(r.food_amount) : null,
              }))}
              height={420}
            />
          </div>

          <div className={styles.tableBox}>
            <h2 className={styles.tableTitle}>記録一覧</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>日時</th>
                  <th>記録者</th>
                  <th>体重</th>
                  <th>食事量</th>
                  <th>排泄</th>
                  <th>体調</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.created_at)}</td>
                    <td>{r.username}</td>
                    <td>{r.weight ? `${r.weight} kg` : '—'}</td>
                    <td>{r.food_amount ? `${r.food_amount}g` : '—'}</td>
                    <td>{r.excretion ?? '—'}</td>
                    <td>{r.condition ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}
