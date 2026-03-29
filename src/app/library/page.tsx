import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import styles from './page.module.css'
import PhotoGrid from './PhotoGrid'

export const metadata: Metadata = { title: 'フォトライブラリ | 猫の健康ノート' }

type Photo = {
  source: 'record' | 'comment'
  image_data: string
  created_at: Date
  username: string
  caption: string | null
}

function dateKeyJST(date: Date): string {
  const d = new Date(date)
  let h = d.getUTCHours() + 9
  let day = d.getUTCDate()
  const month = d.getUTCMonth() + 1
  const year = d.getUTCFullYear()
  if (h >= 24) { h -= 24; day += 1 }
  return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
}

export default async function LibraryPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect('/login')

  const commentPhotos: Photo[] = await sql`
    SELECT
      'comment' AS source,
      c.image_data,
      c.created_at,
      u.username,
      c.body AS caption
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.image_data IS NOT NULL AND c.image_data <> ''
  `

  const recordPhotos: Photo[] = await sql`
    SELECT
      'record' AS source,
      r.image_data,
      r.created_at,
      u.username,
      r.memo AS caption
    FROM records r
    JOIN users u ON u.id = r.user_id
    WHERE r.image_data IS NOT NULL AND r.image_data <> ''
  `

  const allPhotos = [...commentPhotos, ...recordPhotos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // 日付（JST）でグループ化
  const grouped: { dateKey: string; photos: Photo[] }[] = []
  for (const photo of allPhotos) {
    const key = dateKeyJST(new Date(photo.created_at))
    const last = grouped[grouped.length - 1]
    if (last && last.dateKey === key) {
      last.photos.push(photo)
    } else {
      grouped.push({ dateKey: key, photos: [photo] })
    }
  }

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.backLink}>← トップへ戻る</Link>
      <div className={styles.header}>
        <h1 className={styles.title}>フォトライブラリ</h1>
      </div>

      {grouped.length === 0 ? (
        <div className={styles.emptyBox}>
          <span className={styles.emptyIcon}>🖼️</span>
          <p className={styles.empty}>まだ写真がありません</p>
          <p className={styles.emptyDesc}>記録やコメントに写真を追加すると<br />ここに表示されます</p>
        </div>
      ) : (
        grouped.map(({ dateKey, photos }) => (
          <section key={dateKey} className={styles.dateSection}>
            <h2 className={styles.dateLabel}>{dateKey}</h2>
            <PhotoGrid photos={photos.map(p => ({
              image_data: p.image_data,
              username: p.username,
              caption: p.caption,
              source: p.source,
            }))} />
          </section>
        ))
      )}
    </main>
  )
}
