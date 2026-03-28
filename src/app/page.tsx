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

async function getAllCats(): Promise<Cat[]> {
  return sql`
    SELECT id, name, icon_data FROM cats
    ORDER BY created_at ASC
  `
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  const cats = session ? await getAllCats() : []

  return (
    <main className={styles.main}>
      <p className={styles.greeting}>✦ my cats ✦</p>
      <h1 className={styles.title}>うちの子の健康を<br />一緒に守ろう🐾</h1>
      <p className={styles.description}>毎日の記録が、大切なにゃんこを守る第一歩。</p>

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

      <div className={styles.cards}>
        <Link href="/records" className={styles.card}>
          <div className={styles.cardIcon}>📋</div>
          <h2 className={styles.cardTitle}>健康記録</h2>
          <p className={styles.cardDescription}>
            体重・食欲・排泄など日々の状態を記録できます。
          </p>
        </Link>
      </div>
    </main>
  )
}
