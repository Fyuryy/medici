// src/app/rsvp/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import InvitationForm, { FormState } from '@/components/InvitationForm'
import styles from '@/styles/RsvpPage.module.css'

export default function RSVPPage() {
  const { id } = useParams() as { id: string }

  const [invitation, setInvitation] = useState<{
    email: string
    phone?: string
    used: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rsvpError, setRsvpError] = useState('')

  // our controlled form state
  const [formState, setFormState] = useState<FormState>({
    email: '',
    phone: '',
    consent: false,
    name: '',
    dob: '',
    reminder: false,
  })

  // 1) Fetch invitation data
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
          // seed email/phone into formState
          setFormState((fs) => ({
            ...fs,
            email: data.email,
            phone: data.phone || '',
          }))
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid invitation link.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  // 2) Rehydrate any saved form-data on mount
  useEffect(() => {
    if (!id) return
    const saved = localStorage.getItem(`formData-${id}`)
    if (saved) {
      setFormState(JSON.parse(saved))
    }
  }, [id])

  // 3) Handle RSVP -> save, then initiate Stripe Checkout
  const handleRSVP = async (values: FormState) => {
    if (!invitation) return
    setRsvpError('')

    // save for cancel+restore
    localStorage.setItem(`formData-${id}`, JSON.stringify(values))

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_id: id,
          consent: !!values.consent,
          name: values.name,
          birthdate: values.dob,
          phone: values.phone,
          email: values.email,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!
      )
      await stripe!.redirectToCheckout({ sessionId: json.sessionId })
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
      <h1 className={styles.heading}>
        Insérez vos données personnelles et procédez au payement
      </h1>
      {rsvpError && <p style={{ color: 'red' }}>{rsvpError}</p>}
      <InvitationForm
        initialValues={formState}
        expectedEmail={invitation?.email as string}
        onChange={setFormState}
        onSubmit={handleRSVP}
      />
    </div>
  )
}
