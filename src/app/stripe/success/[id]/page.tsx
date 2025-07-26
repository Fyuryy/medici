// src/app/stripe/success/page.tsx

'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const params = useSearchParams()
  const invitationId = params.get('id')

  // clear saved form data on success
  useEffect(() => {
    if (invitationId) {
      localStorage.removeItem(`formData-${invitationId}`)
    }
  }, [invitationId])

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
      <h1>Thank you!</h1>
      <p>Your payment was successful and your RSVP is confirmed.</p>
      <p>We’ll send you an email with your ticket shortly.</p>
      <Link href="/">← Back to home</Link>
    </div>
  )
}
