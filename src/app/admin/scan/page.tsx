// src/app/admin/scan/page.tsx
'use client'
import { useState } from 'react'
import QrScanner from '@/components/QrScanner'

export default function ScanPage() {
  const [message, setMessage] = useState('Point your camera at the QR')
  const [scanned, setScanned] = useState(false)

  const handleScan = async (code: string) => {
    if (scanned) return
    setScanned(true)
    setMessage('Verifying…')

    try {
      const res = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_code: code }),
      })
      const json = await res.json()

      if (json.valid) {
        setMessage(`Ticket valid! Welcome ${json.name || 'Guest'}!`)
      } else {
        setMessage(`Invalid ticket: ${json.error || 'Unknown error'}`)
      }
    } catch (e) {
      if (e instanceof Error) {
        setMessage(`Error: ${e.message}`)
      } else {
        setMessage('An unexpected error occurred')
      }
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Scan Ticket QR</h1>
      <QrScanner onScan={handleScan} onError={console.error} />
      <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>{message}</p>
    </div>
  )
}
