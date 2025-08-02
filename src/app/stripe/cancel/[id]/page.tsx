// src/app/stripe/cancel/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/CancelPage.module.css'

export default function CancelPage() {
  const params = useSearchParams()
  const id = params.get('id')

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Payement annulé</h1>
      <p className={styles.message}>
        Votre payement n&apos;a pas été effectué.
      </p>
      {id ? (
        <Link href={`/rsvp/${id}`} className={styles.link}>
          Retour au formulaire
        </Link>
      ) : (
        <Link href="/" className={styles.link}>
          Retour
        </Link>
      )}
    </div>
  )
}
