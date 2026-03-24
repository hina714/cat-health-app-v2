'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './DeleteCatButton.module.css'

type Props = {
  catId: string
  catName: string
}

export default function DeleteCatButton({ catId, catName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`「${catName}」を削除しますか？\nこの操作は元に戻せません。`)) return

    setLoading(true)
    const res = await fetch(`/api/cats/${catId}`, { method: 'DELETE' })

    if (res.ok) {
      // サーバーコンポーネントのデータを再取得するためページをリフレッシュする
      router.refresh()
    } else {
      alert('削除に失敗しました')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={styles.button}
      aria-label={`${catName}を削除`}
    >
      {loading ? '…' : '✕'}
    </button>
  )
}
