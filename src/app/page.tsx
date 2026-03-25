import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import styles from './page.module.css'

type Cat = {
  id: string
  name: string
  icon_data: string | null
  breed: string | null
}

export default async function HomePage() {
  // ログイン中のユーザーの猫一覧を取得
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  let cats: Cat[] = []
  if (session) {
    const [user] = await sql<{ household_id: string | null }[]>`
      SELECT household_id FROM users WHERE id = ${session.userId}
    `
    if (user?.household_id) {
      cats = await sql<Cat[]>`
        SELECT id, name, icon_data, breed
        FROM cats
        WHERE household_id = ${user.household_id}
        ORDER BY created_at ASC
      `
    }
  }

  return (
    <main className={styles.main}>
      <p className={styles.greeting}>✦ my cats ✦</p>
      <h1 className={styles.title}>うちの子の健康を<br />一緒に守ろう🐾</h1>
      <p className={styles.description}>毎日の記録が、大切なにゃんこを守る第一歩。</p>

      {/* 登録済みの猫一覧 */}
      {cats.length > 0 && (
        <section className={styles.catSection}>
          <h2 className={styles.sectionTitle}>うちの子</h2>
          <div className={styles.catList}>
            {cats.map((cat) => (
              <div key={cat.id} className={styles.catItem}>
                <div className={styles.catIconWrapper}>
                  <div className={styles.catIcon}>
                    {cat.icon_data ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cat.icon_data} alt={cat.name} className={styles.catImage} />
                    ) : (
                      <span className={styles.catEmoji}>🐱</span>
                    )}
                  </div>
                  <Link href={`/cats/${cat.id}/edit`} className={styles.editButton} aria-label={`${cat.name}を編集`}>
                    ✎
                  </Link>
                </div>
                <p className={styles.catName}>{cat.name}</p>
                {cat.breed && <p className={styles.catBreed}>{cat.breed}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📋</div>
          <h2 className={styles.cardTitle}>健康記録</h2>
          <p className={styles.cardDescription}>
            体重・食欲・排泄など日々の状態を記録できます。
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>💉</div>
          <h2 className={styles.cardTitle}>ワクチン・通院</h2>
          <p className={styles.cardDescription}>
            ワクチン接種日や通院履歴を管理できます。
          </p>
        </div>
      </div>
    </main>
  )
}
