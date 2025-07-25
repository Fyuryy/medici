// src/app/stripe/cancel/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function CancelPage() {
  const params = useSearchParams()
  const invitationId = params.get('id')

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
      <h1>Payment Cancelled</h1>
      <p>Your payment was not completed.</p>
      {invitationId ? (
        <Link href={`/rsvp/${invitationId}`}>← Return to the form</Link>
      ) : (
        <Link href="/">← Go back home</Link>
      )}
    </div>
  )
}
