// src/app/rsvp/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import InvitationForm, { FormState } from '@/components/InvitationForm'

export default function RSVPPage() {
  const { id } = useParams() as { id: string }

  const [invitation, setInvitation] = useState<{
    email: string
    phone?: string
    used: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rsvpDone, setRsvpDone] = useState(false)
  const [, setUserId] = useState<string | null>(null)
  const [rsvpError, setRsvpError] = useState('')

  // 1) Fetch invitation
  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/rsvp/${id}`)
        if (!res.ok) {
          const { error: msg } = await res.json()
          throw new Error(msg || 'Invalid invitation link.')
        }
        const data = await res.json()
        if (data.used) {
          setError('This invitation has already been used.')
        } else {
          setInvitation(data)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid invitation link.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  // 2) Handle RSVP form submission
  const handleRSVP = async (formData: FormState) => {
    console.log('RSVP handler fired:', formData)

    if (!invitation) return
    setRsvpError('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_id: id,
          consent: formData.consent,
          name: formData.name,
          birthdate: formData.dob,
          phone: formData.phone,
          email: formData.email,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setUserId(json.user_id)
      setRsvpDone(true)
    } catch (e) {
      setRsvpError(
        e instanceof Error ? e.message : 'An unexpected error occurred.'
      )
    }
  }

  if (loading) return <p>Loading…</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      {!rsvpDone ? (
        <>
          <h1>Please complete your RSVP</h1>
          {rsvpError && <p style={{ color: 'red' }}>{rsvpError}</p>}
          <InvitationForm
            initialValues={{
              phone: invitation!.phone || '',
              email: invitation!.email,
            }}
            onSubmit={handleRSVP}
          />
        </>
      ) : (
        <>
          <h2>All set! Check your email to get your ticket!</h2>
        </>
      )}
    </div>
  )
}
