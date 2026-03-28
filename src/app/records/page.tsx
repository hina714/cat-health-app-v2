import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'

export const metadata: Metadata = { title: '健康記録 | 猫の健康ノート' }
import { redirect } from 'next/navigation'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import styles from './page.module.css'
import CommentSection from './CommentSection'
import DeleteRecordButton from './DeleteRecordButton'

type HealthRecord = {
  id: string
  user_id: string
  username: string
  weight: string | null
  food_amount: string | null
  excretion: string | null
  condition: string | null
  memo: string | null
  created_at: string
}

type Comment = {
  id: string
  record_id: string
  user_id: string
  username: string
  body: string
  created_at: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default async function HealthRecordsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect('/login')

  const records: HealthRecord[] = await sql`
    SELECT r.id, r.user_id, r.weight, r.food_amount, r.excretion, r.condition, r.memo, r.created_at,
           u.username
    FROM records r
    JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
  `

  const comments: Comment[] = await sql`
    SELECT c.id, c.record_id, c.user_id, c.body, c.created_at,
           u.username
    FROM comments c
    JOIN users u ON u.id = c.user_id
    ORDER BY c.created_at ASC
  `

  const commentsByRecord = comments.reduce<{ [key: string]: Comment[] }>((acc, c) => {
    acc[c.record_id] = acc[c.record_id] ?? []
    acc[c.record_id].push(c)
    return acc
  }, {})

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.backLink}>← トップへ戻る</Link>
      <div className={styles.header}>
        <h1 className={styles.title}>健康記録</h1>
        <Link href="/records/new" className={styles.btnNew}>＋ 記録する</Link>
      </div>

      {records.length === 0 ? (
        <div className={styles.emptyBox}>
          <span className={styles.emptyIcon}>📋</span>
          <p className={styles.empty}>まだ記録がありません</p>
          <p className={styles.emptyDesc}>体重・食事量・体調などを記録して<br />うちの子の健康を管理しましょう</p>
          <Link href="/records/new" className={styles.btnNew}>＋ 最初の記録をつける</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {records.map((record) => (
            <div key={record.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.author}>{record.username}</span>
                <span className={styles.date}>{formatDate(record.created_at)}</span>
                {record.user_id === session.userId && (
                  <>
                    <Link href={`/records/${record.id}/edit`} className={styles.editLink}>編集</Link>
                    <DeleteRecordButton recordId={record.id} />
                  </>
                )}
              </div>

              <dl className={styles.fields}>
                {record.weight && (
                  <div className={styles.field}>
                    <dt>体重</dt>
                    <dd>{record.weight} kg</dd>
                  </div>
                )}
                {record.food_amount && (
                  <div className={styles.field}>
                    <dt>食事量</dt>
                    <dd>{record.food_amount}</dd>
                  </div>
                )}
                {record.excretion && (
                  <div className={styles.field}>
                    <dt>排泄</dt>
                    <dd>{record.excretion}</dd>
                  </div>
                )}
                {record.condition && (
                  <div className={styles.field}>
                    <dt>体調</dt>
                    <dd>{record.condition}</dd>
                  </div>
                )}
                {record.memo && (
                  <div className={styles.field + ' ' + styles.fieldMemo}>
                    <dt>メモ</dt>
                    <dd>{record.memo}</dd>
                  </div>
                )}
              </dl>

              <CommentSection
                recordId={record.id}
                comments={commentsByRecord[record.id] ?? []}
                currentUserId={session.userId}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
