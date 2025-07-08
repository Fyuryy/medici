// src/app/admin/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'

export default function AdminHomePage() {
  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <ul className="admin-list">
        <li>
          <Link href="/admin/events">Create & Manage Events</Link>
        </li>
        <li>
          <Link href="/admin/send-invite">Send Invites</Link>
        </li>
        <li>
          <Link href="/admin/scan">Scan Tickets</Link>
        </li>
      </ul>
      <style jsx>{`
        .admin-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1rem;
          text-align: center;
        }
        h1 {
          margin-bottom: 1.5rem;
          font-size: 24px;
        }
        .admin-list {
          list-style: none;
          padding: 0;
        }
        .admin-list li {
          margin: 1rem 0;
        }
        .admin-list a {
          text-decoration: none;
          color: #0070f3;
          font-size: 18px;
        }
        .admin-list a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
