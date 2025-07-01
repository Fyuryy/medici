// src/app/admin/send-invite/page.tsx
'use client'

import { useState, FormEvent } from 'react'

export default function SendInvitePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [inviteId, setInviteId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setInviteId(null)

    try {
      const res = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: process.env.NEXT_PUBLIC_EVENT_ID,
          invited_name: name,
          email,
          phone,
        }),
      })
      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to send invitation')
      }
      setInviteId(payload.id)
      setMessage('Invitation created!')
    } catch (err) {
      if (err instanceof Error) {
        setMessage(`Error: ${err.message}`)
      } else {
        setMessage('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Send Invitation</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send Invite'}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      {inviteId && (
        <p className="link">
          Invite link:{' '}
          <a
            href={`${
              process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            }/rsvp/${inviteId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`${
              process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            }/rsvp/${inviteId}`}
          </a>
        </p>
      )}

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        h1 {
          text-align: center;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
          width: 95%;
        }
        label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: bold;
        }
        input {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #1f2937;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .message {
          margin-top: 1rem;
          text-align: center;
        }
        .link {
          margin-top: 0.5rem;
          word-break: break-all;
          text-align: center;
        }
        .link a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
