'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { compressImage } from '@/lib/compressImage'

type Comment = {
  id: string
  username: string
  body: string
  image_data: string | null
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

export default function CommentSection({ recordId, comments }: Props) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [imageData, setImageData] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, 600)
    setImageData(compressed)
  }

  async function handleSubmit() {
    if (!body.trim() && !imageData) return
    setSubmitting(true)
    setError('')

    const res = await fetch(`/api/records/${recordId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, image_data: imageData }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '投稿に失敗しました')
      setSubmitting(false)
      return
    }

    setBody('')
    setImageData(null)
    setSubmitting(false)
    router.refresh()
  }

  return (
    <div className={styles.comments}>
      {comments.length > 0 && (
        <ul className={styles.commentList}>
          {comments.map((c) => (
            <li key={c.id} className={styles.comment}>
              <div className={styles.commentContent}>
                <div className={styles.commentTop}>
                  <span className={styles.commentAuthor}>{c.username}</span>
                  <span className={styles.commentDate}>{formatDate(c.created_at)}</span>
                </div>
                {c.body && <span className={styles.commentBody}>{c.body}</span>}
                {c.image_data && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_data} alt="コメント画像" className={styles.commentImage} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.commentForm}>
        <div className={styles.commentInputArea}>
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="コメントを追加..."
            className={styles.commentInput}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          />
          <label className={styles.commentImageBtn}>
            📷
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.commentImageInput}
            />
          </label>
        </div>
        {imageData && (
          <div className={styles.commentImagePreviewWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageData} alt="プレビュー" className={styles.commentImagePreview} />
            <button type="button" onClick={() => setImageData(null)} className={styles.commentImageRemove}>✕</button>
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || (!body.trim() && !imageData)}
          className={styles.commentBtn}
        >
          送信
        </button>
      </div>
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}
