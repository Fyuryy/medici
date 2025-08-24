import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { randomUUID } from 'crypto'

const UUID =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export async function GET(req: Request) {
  const url = new URL(req.url)
  const eventId = url.searchParams.get('event_id')
  if (!eventId || !UUID.test(eventId)) {
    return NextResponse.json({ error: 'missing or invalid event_id' }, { status: 400 })
  }

  // NOT NULL-safe placeholder; will be overwritten on form submit
  const placeholder = `pending+${randomUUID()}@example.invalid`

  const { data, error } = await supabaseAdmin
    .from('invitations')
    .insert({ event_id: eventId, used: false, email: placeholder })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'insert failed' }, { status: 500 })
  }

  return NextResponse.redirect(new URL(`/rsvp/${data.id}`, url.origin), { status: 302 })
}
