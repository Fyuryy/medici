'use client'

import Link from 'next/link'
import styles from '@/styles/AdminScreens.module.css'

export default function InvitationsPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stack}>
        <h1 className={styles.title}>Invitations</h1>

        <div className={styles.buttons}>
          <Link
            href="/admin/send-invite"
            className={`${styles.btn} ${styles.btnWide}`}
          >
            INVITER
          </Link>
          <Link
            href="/admin/analytics?tab=invitations"
            className={`${styles.btn} ${styles.btnWide}`}
          >
            ON A INVITÉ QUI ?
          </Link>
        </div>
      </div>
    </div>
  )
}
