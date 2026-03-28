import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SESSION_COOKIE, verifySession } from '@/lib/session'
import { sql } from '@/lib/db'
import styles from './Header.module.css'

// フォーム送信時にサーバー側で実行されるログアウト処理
async function logout() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/login')
}

export default async function Header() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  let username = ''
  if (session) {
    const [user] = await sql<{ username: string }[]>`
      SELECT username FROM users WHERE id = ${session.userId}
    `
    username = user?.username ?? ''
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        猫の健康ノート
      </Link>
      <nav className={styles.nav}>
        <Link href="/records" className={styles.navLink}>健康記録</Link>
      </nav>
      <div className={styles.userArea}>
        {username && <span className={styles.username}>{username}</span>}
        <form action={logout}>
          <button type="submit" className={styles.logoutButton}>
            ログアウト
          </button>
        </form>
      </div>
    </header>
  )
}
