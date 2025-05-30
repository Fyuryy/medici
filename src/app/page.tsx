'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Countdown from 'react-countdown'

export default function Page() {
  const searchParams = useSearchParams()
  const token = searchParams.get('t') || ''
  const [invited, setInvited] = useState<{
    invited_name: string
    email: string
  } | null>()
  const [submitted, setSubmitted] = useState(false)

  // Fetch invitation server-side on mount
  useEffect(() => {
    async function loadInvite() {
      const res = await fetch(`/api/rsvp?token=${token}`)
      const json = await res.json()
      setInvited(res.ok ? json.invited : null)
    }
    if (token) loadInvite()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(form.entries())
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...data }),
    })
    if (res.ok) setSubmitted(true)
  }

  if (invited === undefined) return <p>Chargement…</p>
  if (!invited) return <p>Invitation introuvable.</p>
  if (submitted) return <p>Merci ! Votre présence est confirmée.</p>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-semibold mb-4 text-center">
        Inauguration de MEDICI à la Tour Bel-Air
      </h1>
      <Countdown date={new Date('2025-08-22T19:00:00')} />

      <form
        onSubmit={handleSubmit}
        className="mt-8 w-full max-w-md bg-white p-6 rounded-lg shadow"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium">Prénom</label>
          <input
            name="firstName"
            required
            className="mt-1 w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Nom</label>
          <input
            name="lastName"
            required
            className="mt-1 w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Téléphone</label>
          <input name="phone" className="mt-1 w-full border p-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Date de naissance</label>
          <input
            type="date"
            name="dob"
            className="mt-1 w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="consent"
            id="consent"
            className="mr-2"
            required
          />
          <label htmlFor="consent" className="text-sm">
            J’accepte qu’on me filme et que ces images soient utilisées à des
            fins commerciales
          </label>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded"
        >
          Je confirme ma présence
        </button>
      </form>
    </div>
  )
}
