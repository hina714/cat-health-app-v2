'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

type Comment = {
  id: string
  username: string
  body: string
  created_at: string
}

type Props = {
  recordId: string
  comments: Comment[]
  currentUserId: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default function CommentSection({ recordId, comments, currentUserId }: Props) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!body.trim()) return
    setSubmitting(true)
    setError('')

    const res = await fetch(`/api/records/${recordId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '投稿に失敗しました')
      setSubmitting(false)
      return
    }

    setBody('')
    setSubmitting(false)
    router.refresh()
  }

  return (
    <div className={styles.comments}>
      {comments.length > 0 && (
        <ul className={styles.commentList}>
          {comments.map((c) => (
            <li key={c.id} className={styles.comment}>
              <span className={styles.commentAuthor}>{c.username}</span>
              <span className={styles.commentBody}>{c.body}</span>
              <span className={styles.commentDate}>{formatDate(c.created_at)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.commentForm}>
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="コメントを追加..."
          className={styles.commentInput}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !body.trim()}
          className={styles.commentBtn}
        >
          送信
        </button>
      </div>
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}
