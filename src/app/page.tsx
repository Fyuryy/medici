'use client'

import Image from 'next/image'
import Link from 'next/link'
import Countdown from '@/components/Countdown'
import styles from '../styles/HomePage.module.css'

export default function HomePage() {
  const eventDate = new Date('2025-09-03T17:00:00')

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Image
          src="/logo_no_bg.png"
          alt="MEDICI Logo"
          width={722}
          height={153}
          priority
          sizes="(max-width: 768px) 80vw, 50vw" // Adjusts image size based on viewport
          style={{ width: '100%', height: 'auto' }} // Ensures responsive scaling
        />
      </div>

      <div className={styles.countdown}>
        <Countdown date={eventDate} />
      </div>

      <div className={styles.cta}>
        <Link href="/rsvp" className={styles.rsvpButton}>
          Réserver votre place
        </Link>
      </div>
    </div>
  )
}
