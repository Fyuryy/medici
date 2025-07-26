// src/components/Footer.tsx
'use client'

import Image from 'next/image'
import styles from '@/styles/components/Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Image
          src="/LOGO MEDICI BLANC.png"
          alt="MEDICI Logo"
          width={80}
          height={60}
          className={styles.logo}
        />
      </div>
    </footer>
  )
}
