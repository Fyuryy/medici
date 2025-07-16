// src/app/admin/layout.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import { AuthProvider } from '@/context/AuthContext'
import { AuthGuard } from '@/components/AuthGuard'

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

  return (
    <AuthProvider>
      <AuthGuard>
        {pathname !== '/admin/login' && (
          <header className="admin-header">
            <nav>
              <ul className="nav-list">
                <li>
                  <Link href="/admin">Home</Link>
                </li>
                <li>
                  <Link href="/admin/events">Events</Link>
                </li>
                <li>
                  <Link href="/admin/send-invite">Invites</Link>
                </li>
                <li>
                  <Link href="/admin/scan">Scan</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </nav>
          </header>
        )}
        <main className="admin-main">{children}</main>
        <style jsx>{`
          .admin-header {
            background: #f5f5f5;
            padding: 1rem;
            border-bottom: 1px solid #ddd;
          }
          .nav-list {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
          }
          .nav-list li {
            margin-right: 1rem;
          }
          .nav-list a,
          .nav-list button {
            text-decoration: none;
            background: none;
            border: none;
            font: inherit;
            cursor: pointer;
            color: #0070f3;
          }
          .nav-list a:hover,
          .nav-list button:hover {
            text-decoration: underline;
          }
          .admin-main {
            padding: 2rem;
          }
        `}</style>
      </AuthGuard>
    </AuthProvider>
  )
}
