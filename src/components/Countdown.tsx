// src/components/Countdown.tsx
'use client'

import { useEffect, useState } from 'react'
import styles from '../styles/components/Countdown.module.scss'

export interface CountdownProps {
  /** target date; defaults to 22 Aug 2025 17:30 (Europe/Zurich) */
  date?: Date
}

export default function Countdown({
  date = new Date('2025-08-22T15:30:00Z'), // UTC 15:30 = CEST 17:30
}: CountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, date.getTime() - Date.now())
  )

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, date.getTime() - Date.now()))
    }, 1000)
    return () => clearInterval(id)
  }, [date])

  const ms = remaining
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24
  const minutes = Math.floor(ms / (1000 * 60)) % 60
  const seconds = Math.floor(ms / 1000) % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  const parts = [
    { label: 'Jours', value: pad(days) },
    { label: 'Heures', value: pad(hours) },
    { label: 'Minutes', value: pad(minutes) },
    { label: 'Secondes', value: pad(seconds) },
  ]

  return (
    <div className={styles.countdown}>
      {parts.map((p) => (
        <div key={p.label} className={styles.segment}>
          <span className={styles.digits}>{p.value}</span>
          <span className={styles.label}>{p.label}</span>
        </div>
      ))}
    </div>
  )
}
