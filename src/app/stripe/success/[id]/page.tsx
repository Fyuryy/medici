// src/app/stripe/success/page.tsx
'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/SuccessPage.module.css'

export default function SuccessPage() {
  const params = useSearchParams()
  const id = params.get('id')

  // clear saved form data on success
  useEffect(() => {
    if (id) {
      localStorage.removeItem(`formData-${id}`)
    }
  }, [id])

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Merci!</h1>
      <p className={styles.message}>Votre payement a été accepté.</p>
      <p className={styles.message}>
        Nous vous enverrons bientôt le ticket par e-mail. Hâte de vous retrouver
        pour une soirée inoubliable!
      </p>
      <Link href="/" className={styles.link}>
        Retour
      </Link>
    </div>
  )
}
