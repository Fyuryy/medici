// src/app/tickets/[ticket_code]/page.tsx
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import QRCodeReact from 'react-qr-code' // for on-page QR
import { notFound } from 'next/navigation'

export default async function TicketPage({ params }) {
  const { ticket_code } = params
  // 1) Fetch with the service role key (ignores RLS)
  const { data: ticket, error } = await supabaseAdmin
    .from('tickets')
    .select('event_id, user_id, issued_at')
    .eq('ticket_code', ticket_code)
    .single()

  if (error || !ticket) {
    return notFound() // shows your 404 page
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('name')
    .eq('id', ticket.user_id)
    .single()

  if (!user) {
  }

  // 2) Build the URL that you want the QR to encode
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const ticketLink = `${baseUrl}/tickets/${ticket_code}`

  // 3a) If you prefer an inline QR.svg, use react-qr-code:
  return (
    <div style={{ textAlign: 'center', margin: '2rem' }}>
      <h1>Here&apos;s your ticket, {user?.name}</h1>

      <div
        style={{
          display: 'inline-block',
          background: '#fff',
          padding: 16,
          margin: '1rem 0',
        }}
      >
        <QRCodeReact value={ticketLink} size={256} />
      </div>
      <p>This QR code was sent to you via email.</p>
    </div>
  )
}
