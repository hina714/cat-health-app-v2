'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Header.module.css'

const links = [
  { href: '/records', label: '健康記録' },
  { href: '/graph', label: 'グラフ' },
  { href: '/library', label: 'ライブラリ' },
]

export default function NavLinks() {
  const pathname = usePathname()
  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.navLink} ${pathname.startsWith(href) ? styles.navLinkActive : ''}`}
        >
          {label}
        </Link>
      ))}
    </>
  )
}
