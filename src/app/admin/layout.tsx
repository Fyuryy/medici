'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import { AuthProvider } from '@/context/AuthContext'
import { AuthGuard } from '@/components/AuthGuard'
import styles from '@/styles/AdminLayout.module.css'

const navLinks = [
  { href: '/admin', label: 'Home' },
  { href: '/admin/events', label: 'Evénements' },
  { href: '/admin/invitations', label: 'Invitations' },
  { href: '/admin/tickets', label: 'Billets' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/admin/login')
  }

  const showNav = pathname !== '/admin/login'

  // Scroll affordance state
  const [hasOverflow, setHasOverflow] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    const compute = () => {
      const doc = document.documentElement
      const scrollY = window.scrollY || doc.scrollTop
      const vh = window.innerHeight
      const sh = doc.scrollHeight
      setHasOverflow(sh > vh + 1)
      setAtTop(scrollY <= 1)
      setAtBottom(vh + scrollY >= sh - 1)
    }
    compute()
    window.addEventListener('scroll', compute, { passive: true })
    window.addEventListener('resize', compute)
    const ro = new ResizeObserver(compute)
    ro.observe(document.body)
    return () => {
      window.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
      ro.disconnect()
    }
  }, [])

  return (
    <AuthProvider>
      <AuthGuard>
        {showNav && (
          <header className={styles.header}>
            <nav className={styles.nav}>
              <span className={styles.brand}>Admin</span>
              <div className={styles.links}>
                {navLinks.map(({ href, label }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`${styles.link} ${
                        active ? styles.active : ''
                      }`}
                    >
                      {label}
                    </Link>
                  )
                })}
              </div>
              <div className={styles.spacer} />
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </nav>
          </header>
        )}

        {/* Edge fades + chevron cues */}
        {hasOverflow && atTop && (
          <>
            <div
              className={`${styles.edgeFade} ${styles.bottom} ${styles.visible}`}
            />
            <div
              className={`${styles.scrollCue} ${styles.visible}`}
              aria-hidden="true"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </>
        )}
        {hasOverflow && !atTop && !atBottom && (
          <div
            className={`${styles.edgeFade} ${styles.top} ${styles.visible}`}
          />
        )}

        <main className={`${styles.main} ${!atTop ? styles.scrolled : ''}`}>
          {children}
        </main>
      </AuthGuard>
    </AuthProvider>
  )
}
