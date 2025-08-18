'use client'

import Link from 'next/link'
import styles from '@/styles/AdminScreens.module.css'

export default function TicketsPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stack}>
        <h1 className={styles.title}>Tickets</h1>

        <div className={styles.buttons}>
          <Link
            href="/admin/scan"
            className={`${styles.btn} ${styles.btnWide}`}
          >
            SCAN
          </Link>
          <Link
            href="/admin/analytics?tab=tickets"
            className={`${styles.btn} ${styles.btnWide}`}
          >
            QUI A PAYÉ ?
          </Link>
        </div>
      </div>
    </div>
  )
}
