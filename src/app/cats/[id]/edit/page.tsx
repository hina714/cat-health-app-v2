import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { verifySession, SESSION_COOKIE } from '@/lib/session'
import { sql } from '@/lib/db'
import EditCatForm from './EditCatForm'

type Cat = {
  id: string
  name: string
  icon_data: string | null
  breed: string | null
  birthdate: string | null
  neutered: boolean | null
}

export default async function EditCatPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const session = token ? await verifySession(token) : null

  if (!session) redirect('/login')

  const { id } = await params

  const [user] = await sql<{ household_id: string | null }[]>`
    SELECT household_id FROM users WHERE id = ${session.userId}
  `
  if (!user?.household_id) redirect('/login')

  const [cat] = await sql<Cat[]>`
    SELECT id, name, icon_data, breed, birthdate, neutered
    FROM cats
    WHERE id = ${id} AND household_id = ${user.household_id}
  `

  if (!cat) notFound()

  return <EditCatForm cat={cat} />
}
