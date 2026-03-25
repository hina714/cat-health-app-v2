import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import CatEditForm from './CatEditForm'
import styles from './page.module.css'

type Cat = {
  id: string
  name: string
  icon_data: string | null
}

export default async function CatEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  if (!session) redirect('/login')

  const { id } = await params

  const [cat]: [Cat?] = await sql`
    SELECT id, name, icon_data
    FROM cats
    WHERE id = ${id}
  `

  if (!cat) notFound()

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{cat.name} のアイコン編集</h1>
      <CatEditForm cat={cat} />
    </main>
  )
}
