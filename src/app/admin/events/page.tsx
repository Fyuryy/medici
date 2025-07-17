// src/app/admin/events/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

interface Event {
  id: string
  name: string
  date_time: string
  location: string
  created_at: string
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', date_time: '', location: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('date_time', { ascending: true })
    if (error) {
      setError(error.message)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { name, date_time, location } = form
    if (!name || !date_time || !location) {
      setError('All fields are required')
      return
    }
    const { error } = await supabaseAdmin
      .from('events')
      .insert([{ name, date_time, location }])
    if (error) {
      setError(error.message)
    } else {
      setForm({ name: '', date_time: '', location: '' })
      fetchEvents()
    }
  }

  return (
    <div className="events-container">
      <h1>Events Management</h1>

      {error && <div className="error">{error}</div>}

      <section className="event-list">
        <h2>Existing Events</h2>
        {loading ? (
          <p>Loading events...</p>
        ) : events.length ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date & Time</th>
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
          />

          <label htmlFor="date_time">Date & Time</label>
          <input
            id="date_time"
            name="date_time"
            type="datetime-local"
            value={form.date_time}
            onChange={handleChange}
          />

          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
          />

          <button type="submit">Create Event</button>
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
        button:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  )
}
