'use client'

import { useEffect, useState } from 'react'

export interface CountdownProps {
  date: Date
}

export default function Countdown({ date }: CountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, date.getTime() - Date.now())
  )

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, date.getTime() - Date.now()))
    }, 1000)
    return () => clearInterval(id)
  }, [date])

  const seconds = Math.floor(remaining / 1000) % 60
  const minutes = Math.floor(remaining / (1000 * 60)) % 60
  const hours = Math.floor(remaining / (1000 * 60 * 60)) % 24
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))

  return (
    <div>
      {days}d {hours}h {minutes}m {seconds}s
    </div>
  )
}
