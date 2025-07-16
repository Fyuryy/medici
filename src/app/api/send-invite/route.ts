import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail } from '@/utils/email'
import { sendSms } from '@/utils/sms'

export async function POST(request: Request) {
  // 1) get the bearer token
  const authHeader = request.headers.get('authorization') || ''
  const accessToken = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) create a Supabase client scoped to that user
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    }
  )

  // 3) validate session & get user
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser()

  if (sessionError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 4) check admin rights with your admin key
  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admin')
    .select('id')
    .eq('id', user.id)
    .single()

    console.log("Admin: ", adminRow, "Error:", adminError)
  if (adminError || !adminRow) {

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 5) now run your invite logic exactly as before…
  try {
    const { email, phone } = await request.json()
    const event_id = process.env.NEXT_PUBLIC_EVENT_ID
    if (!event_id) {
      return NextResponse.json(
        { error: 'Server configuration error: event ID not set' },
        { status: 500 }
      )
    }
    if (!email) {
      return NextResponse.json(
        { error: 'Missing required field: email' },
        { status: 400 }
      )
    }

    // check existing invite
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('event_id', event_id)
      .eq('email', email)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    let invitationId = existing?.id
    if (!invitationId) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('invitations')
        .insert({ event_id, email, phone })
        .select('id')
        .single()
      if (insertError || !inserted) {
        return NextResponse.json(
          { error: insertError?.message || 'Failed to create invitation' },
          { status: 500 }
        )
      }
      invitationId = inserted.id
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const inviteLink = `${base}/rsvp/${invitationId}`

    await Promise.all([
      sendEmail(
        email,
        "You're invited to MEDICI 🎉",
        `Please RSVP: ${inviteLink}`,
        `<p><a href="${inviteLink}">Click here to RSVP</a></p>`
      ),
      phone
        ? sendSms(phone, `MEDICI invite: RSVP at ${inviteLink}`)
        : Promise.resolve(),
    ])

    return NextResponse.json({ id: invitationId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
