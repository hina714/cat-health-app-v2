'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'ログインに失敗しました')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.icon}>🐾</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            ユーザー名
            <input
              type="text"
              name="username"
              required
              className={styles.input}
              autoComplete="username"
            />
          </label>
          <label className={styles.label}>
            パスワード
            <input
              type="password"
              name="password"
              required
              className={styles.input}
              autoComplete="current-password"
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
