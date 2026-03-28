'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

type Props = {
  recordId: string
}

export default function DeleteRecordButton({ recordId }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('この記録を削除しますか？')) return

    setDeleting(true)
    const res = await fetch(`/api/records/${recordId}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error ?? '削除に失敗しました')
      setDeleting(false)
      return
    }
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className={styles.deleteBtn}
    >
      削除
    </button>
  )
}
