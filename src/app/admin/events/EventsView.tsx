// src/app/admin/events/EventsView.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import type { Event } from './page'

interface EventsViewProps {
  initialEvents: Event[]
}

export default function EventsView({ initialEvents }: EventsViewProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [form, setForm] = useState({ name: '', date_time: '', location: '' })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { name, date_time, location } = form
    if (!name || !date_time || !location) {
      setError('All fields are required')
      return
    }

    try {
      setIsSubmitting(true)
      const { data, error: insertError } = await supabaseClient
        .from('events')
        .insert([{ name, date_time, location }])
        .select('id, name, date_time, location, created_at')

      if (insertError) {
        throw insertError
      }

      // Append new events and clear form
      setEvents((prev) => [...prev, ...(data ?? [])])
      setForm({ name: '', date_time: '', location: '' })

      // Optionally, revalidate the page
      router.refresh()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to create event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="events-container">
      <h1>Events Management</h1>

      {error && <div className="error">{error}</div>}

      <section className="event-list">
        <h2>Existing Events</h2>
        {events.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date &amp; Time</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.name}</td>
                  <td>{new Date(ev.date_time).toLocaleString()}</td>
                  <td>{ev.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No events found.</p>
        )}
      </section>

      <section className="event-form">
        <h2>Create New Event</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="date_time">Date &amp; Time</label>
          <input
            id="date_time"
            name="date_time"
            type="datetime-local"
            value={form.date_time}
            onChange={handleChange}
            required
          />

          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Event'}
          </button>
        </form>
      </section>

      <style jsx>{`
        .events-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 1rem;
        }
        h1,
        h2 {
          text-align: center;
        }
        .error {
          color: red;
          text-align: center;
          margin-bottom: 1rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
        }
        th,
        td {
          border: 1px solid #ccc;
          padding: 0.5rem;
          text-align: left;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }
        label {
          font-weight: bold;
        }
        input {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          margin-top: 1rem;
          padding: 0.75rem;
          font-size: 1rem;
          border: none;
          border-radius: 4px;
          background-color: #0070f3;
          color: white;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        button:hover:not(:disabled) {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  )
}
