// components/RsvpButton.tsx
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

interface RsvpButtonProps {
  eventId: string
  userId: string
  priceId: string
}

export default function RsvpButton({
  eventId,
  userId,
  priceId,
}: RsvpButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleRsvp = async () => {
    setLoading(true)
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, userId, priceId }),
    })
    const { sessionId, error } = await res.json()
    if (error) {
      console.error(error)
      setLoading(false)
      return
    }
    const stripe = await stripePromise
    const { error: stripeErr } = await stripe!.redirectToCheckout({ sessionId })
    if (stripeErr) console.error(stripeErr)
    // Stripe takes over; you’ll land on /success or /cancel.
  }

  return (
    <button onClick={handleRsvp} disabled={loading}>
      {loading ? 'Redirecting…' : 'RSVP & Pay'}
    </button>
  )
}
