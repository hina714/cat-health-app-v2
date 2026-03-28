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
    await fetch(`/api/records/${recordId}`, { method: 'DELETE' })
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
