import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import styles from './page.module.css'

type Cat = {
  id: string
  name: string
  icon_data: string | null
  breed: string | null
  birthdate: Date | null
  neutered: boolean | null
}

function formatBirthdate(birthdate: Date): string {
  const year = birthdate.getUTCFullYear()
  const month = birthdate.getUTCMonth() + 1
  const day = birthdate.getUTCDate()
  return `${year}年${month}月${day}日`
}

function calcAge(birthdate: Date): string {
  const birthYear = birthdate.getUTCFullYear()
  const birthMonth = birthdate.getUTCMonth() + 1
  const birthDay = birthdate.getUTCDate()
  const now = new Date()
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth() + 1
  const nowDay = now.getDate()

  let years = nowYear - birthYear
  let months = nowMonth - birthMonth
  if (nowDay < birthDay) months--
  if (months < 0) { years--; months += 12 }

  if (years === 0) return `${months}ヶ月`
  if (months === 0) return `${years}歳`
  return `${years}歳${months}ヶ月`
}

export default async function CatProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect('/login')

  const { id } = await params
  const [cat]: [Cat?] = await sql`
    SELECT id, name, icon_data, breed, birthdate, neutered
    FROM cats
    WHERE id = ${id}
  `
  if (!cat) notFound()

  const neuteredLabel =
    cat.neutered === true ? 'あり' : cat.neutered === false ? 'なし' : '不明'

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.iconArea}>
          <div className={styles.iconWrapper}>
            {cat.icon_data ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cat.icon_data} alt={cat.name} className={styles.iconImg} />
            ) : (
              <span className={styles.iconDefault}>🐱</span>
            )}
          </div>
          <Link href={`/cats/${cat.id}/edit`} className={styles.changeIconBtn}>
            アイコンを変更
          </Link>
        </div>

        <h1 className={styles.name}>{cat.name}</h1>

        <dl className={styles.profileList}>
          <div className={styles.profileRow}>
            <dt className={styles.profileLabel}>品種</dt>
            <dd className={styles.profileValue}>{cat.breed ?? '－'}</dd>
          </div>
          <div className={styles.profileRow}>
            <dt className={styles.profileLabel}>誕生日</dt>
            <dd className={styles.profileValue}>
              {cat.birthdate ? formatBirthdate(cat.birthdate) : '－'}
            </dd>
          </div>
          {cat.birthdate && (
            <div className={styles.profileRow}>
              <dt className={styles.profileLabel}>年齢</dt>
              <dd className={styles.profileValue}>{calcAge(cat.birthdate)}</dd>
            </div>
          )}
          <div className={styles.profileRow}>
            <dt className={styles.profileLabel}>去勢・避妊</dt>
            <dd className={styles.profileValue}>{neuteredLabel}</dd>
          </div>
        </dl>

        <Link href="/" className={styles.backLink}>← トップへ戻る</Link>
      </div>
    </main>
  )
}
