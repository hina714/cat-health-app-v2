import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import styles from './page.module.css'

type Cat = {
  id: string
  name: string
  icon_data: string | null
}

type TodayRecord = {
  username: string
  created_at: Date
}

async function getAllCats(): Promise<Cat[]> {
  return sql`
    SELECT id, name, icon_data FROM cats
    ORDER BY created_at ASC
  `
}

async function getTodayRecords(): Promise<TodayRecord[]> {
  return sql`
    SELECT u.username, r.created_at
    FROM records r
    JOIN users u ON u.id = r.user_id
    WHERE (r.created_at AT TIME ZONE 'Asia/Tokyo')::date = (NOW() AT TIME ZONE 'Asia/Tokyo')::date
    ORDER BY r.created_at ASC
  `
}

function formatTime(date: Date): string {
  const d = new Date(date)
  const h = d.getUTCHours() + 9
  const m = d.getUTCMinutes()
  const hh = (h >= 24 ? h - 24 : h).toString().padStart(2, '0')
  const mm = m.toString().padStart(2, '0')
  return `${hh}:${mm}`
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  const [cats, todayRecords] = session
    ? await Promise.all([getAllCats(), getTodayRecords()])
    : [[], []]

  return (
    <main className={styles.main}>
      <p className={styles.greeting}>✦ my cats ✦</p>
      <h1 className={styles.title}>うちの子の毎日の健康のために🐱</h1>
      <p className={styles.description}>毎日の記録が、大切なうちの子を守る第一歩。</p>

      {session && cats.length > 0 && (
        <section className={styles.catsSection}>
          <h2 className={styles.sectionTitle}>うちの子</h2>
          <div className={styles.catList}>
            {cats.map((cat) => (
              <Link key={cat.id} href={`/cats/${cat.id}`} className={styles.catItem}>
                <div className={styles.catIconWrapper}>
                  {cat.icon_data ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.icon_data}
                      alt={cat.name}
                      className={styles.catIcon}
                    />
                  ) : (
                    <span className={styles.catIconDefault}>🐱</span>
                  )}
                </div>
                <p className={styles.catName}>{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {session && (
        <div className={styles.todayBox}>
          <p className={styles.todayLabel}>今日の記録</p>
          {todayRecords.length === 0 ? (
            <p className={styles.todayEmpty}>今日の記録がありません</p>
          ) : (
            <ul className={styles.todayList}>
              {todayRecords.map((r, i) => (
                <li key={i} className={styles.todayItem}>
                  <span className={styles.todayUser}>{r.username}</span>
                  が
                  <span className={styles.todayTime}>{formatTime(r.created_at)}</span>
                  に
                  <Link href="/records" className={styles.todayLink}>記録しています</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className={styles.cards}>
        <Link href="/records" className={styles.card}>
          <div className={styles.cardIcon}>📋</div>
          <h2 className={styles.cardTitle}>健康記録</h2>
          <p className={styles.cardDescription}>体重 / 食事量 / 排泄 / 体調 / 様子・メモ</p>
        </Link>
      </div>
    </main>
  )
}
