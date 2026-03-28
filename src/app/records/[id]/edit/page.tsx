import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'

export const metadata: Metadata = { title: '記録を編集 | 猫の健康ノート' }
import { notFound, redirect } from 'next/navigation'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import RecordForm from '../../RecordForm'
import styles from './page.module.css'

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect('/login')

  const { id } = await params

  const [record] = await sql`
    SELECT id, user_id, weight, food_amount, excretion, condition, memo
    FROM records
    WHERE id = ${id}
  `

  if (!record) notFound()

  // 書いた本人以外はトップに追い返す
  if (record.user_id !== session.userId) redirect('/records')

  return (
    <main className={styles.main}>
      <Link href="/records" className={styles.backLink}>← 記録一覧へ戻る</Link>
      <h1 className={styles.title}>記録を編集</h1>
      <RecordForm
        mode="edit"
        recordId={id}
        initial={{
          weight: record.weight?.toString() ?? '',
          food_amount: record.food_amount ?? '',
          excretion: record.excretion ?? '',
          condition: record.condition ?? '',
          memo: record.memo ?? '',
        }}
      />
    </main>
  )
}
