'use client'

import Image from 'next/image'
import Countdown from '@/components/Countdown'
import styles from '../styles/HomePage.module.css'

export default function HomePage() {
  const eventDate = new Date('2025-08-22T19:00:00')

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Image
          src="/logo_no_bg.png"
          alt="MEDICI Logo"
          width={722}
          height={153}
          priority
        />
      </div>

      <div className={styles.countdown}>
        <Countdown date={eventDate} />
      </div>
    </div>
  )
}
