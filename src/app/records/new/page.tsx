import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'

export const metadata: Metadata = { title: '記録する | 猫の健康ノート' }
import { redirect } from 'next/navigation'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import RecordForm from '../RecordForm'
import styles from './page.module.css'

export default async function NewRecordPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect('/login')

  return (
    <main className={styles.main}>
      <Link href="/records" className={styles.backLink}>← 記録一覧へ戻る</Link>
      <h1 className={styles.title}>今日の記録</h1>
      <RecordForm mode="new" />
    </main>
  )
}
