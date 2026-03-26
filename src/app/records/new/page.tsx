import { cookies } from 'next/headers'
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
      <h1 className={styles.title}>今日の記録</h1>
      <RecordForm mode="new" />
    </main>
  )
}
