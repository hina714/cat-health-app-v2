import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SESSION_COOKIE } from '@/lib/session'
import styles from './Header.module.css'

// フォーム送信時にサーバー側で実行されるログアウト処理
async function logout() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/login')
}

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        猫の健康ノート
      </Link>
      <nav className={styles.nav}>
        <Link href="/records" className={styles.navLink}>健康記録</Link>
      </nav>
      <form action={logout}>
        <button type="submit" className={styles.logoutButton}>
          ログアウト
        </button>
      </form>
    </header>
  )
}
