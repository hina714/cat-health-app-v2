import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import styles from './page.module.css'
import CommentSection from './CommentSection'
import DeleteRecordButton from './DeleteRecordButton'
import HealthChart from './HealthChart'

export const metadata: Metadata = { title: '健康記録 | 猫の健康ノート' }

type HealthRecord = {
  id: string
  user_id: string
  username: string
  weight: string | null
  food_amount: string | null
  excretion: string | null
  condition: string | null
  memo: string | null
  image_data: string | null
  created_at: string
}

type Comment = {
  id: string
  record_id: string
  user_id: string
  username: string
  body: string
  image_data: string | null
  created_at: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function dateKeyJST(dateStr: string): string {
  const ms = new Date(dateStr).getTime() + 9 * 60 * 60 * 1000
  const d = new Date(ms)
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`
}

export default async function HealthRecordsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect('/login')

  const records: HealthRecord[] = await sql`
    SELECT r.id, r.user_id, r.weight, r.food_amount, r.excretion, r.condition, r.memo, r.image_data, r.created_at,
           u.username
    FROM records r
    JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
  `

  const comments: Comment[] = await sql`
    SELECT c.id, c.record_id, c.user_id, c.body, c.image_data, c.created_at,
           u.username
    FROM comments c
    JOIN users u ON u.id = c.user_id
    ORDER BY c.created_at DESC
  `

  const commentsByRecord = comments.reduce<{ [key: string]: Comment[] }>((acc, c) => {
    acc[c.record_id] = acc[c.record_id] ?? []
    acc[c.record_id].push(c)
    return acc
  }, {})

  // 日付（JST）でグループ化
  const grouped: { dateKey: string; records: HealthRecord[] }[] = []
  for (const record of records) {
    const key = dateKeyJST(record.created_at)
    const last = grouped[grouped.length - 1]
    if (last && last.dateKey === key) last.records.push(record)
    else grouped.push({ dateKey: key, records: [record] })
  }

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.backLink}>← トップへ戻る</Link>
      <div className={styles.header}>
        <h1 className={styles.title}>健康記録</h1>
        <Link href="/records/new" className={styles.btnNew}>＋ 記録する</Link>
      </div>

      {records.length >= 2 && (
        <div className={styles.chartBox}>
          <h2 className={styles.chartTitle}>グラフ</h2>
          <HealthChart
            data={records.map((r) => ({
              date: r.created_at,
              weight: r.weight ? Number(r.weight) : null,
              food_amount: r.food_amount ? Number(r.food_amount) : null,
            }))}
          />
        </div>
      )}

      {records.length === 0 ? (
        <div className={styles.emptyBox}>
          <span className={styles.emptyIcon}>📋</span>
          <p className={styles.empty}>まだ記録がありません</p>
          <p className={styles.emptyDesc}>体重・食事量・体調などを記録して<br />うちの子の健康を管理しましょう</p>
          <Link href="/records/new" className={styles.btnNew}>＋ 最初の記録をつける</Link>
        </div>
      ) : (
        <>
          {grouped.map(({ dateKey, records: dayRecords }) => (
            <section key={dateKey} className={styles.dateGroup}>
              <h2 className={styles.dateGroupLabel}>{dateKey}</h2>
              <div className={styles.list}>
                {dayRecords.map((record) => (
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
                          <dd>{record.food_amount}g</dd>
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

                    {record.image_data && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={record.image_data} alt="記録の写真" className={styles.recordImage} />
                    )}

                    <CommentSection
                      recordId={record.id}
                      comments={commentsByRecord[record.id] ?? []}
                      currentUserId={session.userId}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </main>
  )
}
