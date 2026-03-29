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

type RecentRecord = {
  id: string
  username: string
  weight: string | null
  food_amount: string | null
  excretion: string | null
  condition: string | null
  memo: string | null
  created_at: Date
}

async function getAllCats(): Promise<Cat[]> {
  return sql`
    SELECT id, name, icon_data FROM cats
    ORDER BY created_at ASC
  `
}

async function getRecentRecords(): Promise<RecentRecord[]> {
  return sql`
    SELECT r.id, r.weight, r.food_amount, r.excretion, r.condition, r.memo, r.created_at,
           u.username
    FROM records r
    JOIN users u ON u.id = r.user_id
    WHERE (r.created_at AT TIME ZONE 'Asia/Tokyo')::date
          >= (NOW() AT TIME ZONE 'Asia/Tokyo')::date - interval '2 days'
    ORDER BY r.created_at DESC
  `
}

function formatDateTime(date: Date): string {
  const d = new Date(date)
  let h = d.getUTCHours() + 9
  const m = d.getUTCMinutes()
  let day = d.getUTCDate()
  const month = d.getUTCMonth() + 1
  if (h >= 24) { h -= 24; day += 1 }
  return `${month}/${day} ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function isTodayJST(date: Date): boolean {
  const toJSTDate = (d: Date) => {
    const ms = d.getTime() + 9 * 60 * 60 * 1000
    const j = new Date(ms)
    return `${j.getUTCFullYear()}-${j.getUTCMonth()}-${j.getUTCDate()}`
  }
  return toJSTDate(new Date(date)) === toJSTDate(new Date())
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  const [cats, recentRecords] = session
    ? await Promise.all([getAllCats(), getRecentRecords()])
    : [[], []]

  const hasTodayRecord = recentRecords.some((r) => isTodayJST(new Date(r.created_at)))

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
                    <img src={cat.icon_data} alt={cat.name} className={styles.catIcon} />
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
        <section className={styles.recentSection}>
          <div className={styles.recentSectionHeader}>
            <h2 className={styles.sectionTitle}>最近の記録（3日以内）</h2>
            {!hasTodayRecord && (
              <span className={styles.noTodayBadge}>🔔 今日はまだ記録がありません</span>
            )}
          </div>

          {recentRecords.length === 0 ? (
            <div className={styles.recentEmpty}>
              <p>3日以内の記録がありません</p>
              <Link href="/records/new" className={styles.recentEmptyLink}>＋ 記録する</Link>
            </div>
          ) : (
            <div className={styles.recentList}>
              {recentRecords.map((r) => (
                <div key={r.id} className={styles.recentCard}>
                  <div className={styles.recentHeader}>
                    <span className={styles.recentUser}>{r.username}</span>
                    <span className={styles.recentDate}>{formatDateTime(r.created_at)}</span>
                  </div>
                  <dl className={styles.recentFields}>
                    {r.weight && (
                      <div className={styles.recentField}>
                        <dt>体重</dt>
                        <dd>{r.weight} kg</dd>
                      </div>
                    )}
                    {r.food_amount && (
                      <div className={styles.recentField}>
                        <dt>食事量</dt>
                        <dd>{r.food_amount}g</dd>
                      </div>
                    )}
                    {r.excretion && (
                      <div className={styles.recentField}>
                        <dt>排泄</dt>
                        <dd>{r.excretion}</dd>
                      </div>
                    )}
                    {r.condition && (
                      <div className={styles.recentField}>
                        <dt>体調</dt>
                        <dd>{r.condition}</dd>
                      </div>
                    )}
                    {r.memo && (
                      <div className={styles.recentField + ' ' + styles.recentFieldMemo}>
                        <dt>メモ</dt>
                        <dd>{r.memo}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          )}
          <Link href="/records" className={styles.recentMore}>すべての記録を見る →</Link>
        </section>
      )}

      <div className={styles.cards}>
        <Link href="/records" className={styles.card}>
          <div className={styles.cardIcon}>📋</div>
          <h2 className={styles.cardTitle}>健康記録</h2>
          <p className={styles.cardDescription}>体重 / 食事量 / 排泄 / 体調 / 様子・メモ</p>
        </Link>
        <Link href="/graph" className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <h2 className={styles.cardTitle}>健康グラフ</h2>
          <p className={styles.cardDescription}>体重・食事量の推移をグラフで確認</p>
        </Link>
        <Link href="/library" className={styles.card}>
          <div className={styles.cardIcon}>🖼️</div>
          <h2 className={styles.cardTitle}>フォトライブラリ</h2>
          <p className={styles.cardDescription}>記録・コメントの写真を日付でまとめて確認</p>
        </Link>
      </div>
    </main>
  )
}
