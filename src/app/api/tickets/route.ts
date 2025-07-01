// src/app/api/tickets/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    // now include invitation_id
    const {
      user_id,
      event_id,
      invitation_id,    // ← add this
    }: {
      user_id?: string
      event_id?: string
      invitation_id?: string
    } = await request.json()

    if (!user_id || !event_id || !invitation_id) {
      return NextResponse.json(
        { error: 'Missing user_id, event_id, or invitation_id' },
        { status: 400 }
      )
    }

    // 1) Generate a unique ticket code
    const ticket_code = uuidv4()

    // 2) Insert the ticket record
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert({
        user_id,
        event_id,
        ticket_code,
        issued_at: new Date().toISOString(),
      })
      .select('ticket_code')
      .single()

    if (error || !data) {
      console.error('Ticket insert error', error)
      return NextResponse.json(
        { error: 'Could not create ticket.' },
        { status: 500 }
      )
    }

    // 3) **Mark the invitation as used**
    await supabaseAdmin
      .from('invitations')
      .update({ used: true })
      .eq('id', invitation_id)

    // 4) Return the generated ticket code
    return NextResponse.json({ ticket_code: data.ticket_code })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
    console.error('Error in POST /api/tickets:', err)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
