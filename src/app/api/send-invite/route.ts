// src/app/api/send-invite/route.ts
import {parse} from 'cookie'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail } from '@/utils/email'
import { sendSms } from '@/utils/sms'

export async function POST(request: Request) {
  // ───────────────────────────────────────────────────────────────────────────────
  // 1) grab the raw cookie header and parse it
  console.log("cookie header:", request.headers.get("cookie"))
  const cookieHeader = request.headers.get('cookie') || ''
  const parsed = parse(cookieHeader)
  const accessToken =
    parsed['sb-access-token'] ||
    parsed['supabase-access-token']

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) now build your client as before
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Check admin table using supabaseAdmin
  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admin')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (adminError || !adminRow) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { email, phone } = await request.json()

    // 3) Ensure event ID is configured
    const event_id = process.env.NEXT_PUBLIC_EVENT_ID
    if (!event_id) {
      console.error('EVENT_ID is not defined')
      return NextResponse.json(
        { error: 'Server configuration error: event ID not set' },
        { status: 500 }
      )
    }

    // 4) Validate required field
    if (!email) {
      return NextResponse.json(
        { error: 'Missing required field: email' },
        { status: 400 }
      )
    }

    // 5) Check for an existing invitation
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('event_id', event_id)
      .eq('email', email)
      .single()
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing invite:', fetchError)
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // 6) Insert or reuse
    let invitationId: string
    if (existing) {
      invitationId = existing.id
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('invitations')
        .insert({ event_id, email, phone })
        .select('id')
        .single()
      if (insertError || !inserted) {
        console.error('Error inserting invite:', insertError)
        return NextResponse.json(
          { error: insertError?.message || 'Failed to create invitation' },
          { status: 500 }
        )
      }
      invitationId = inserted.id
    }

    // 7) Build link and send
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
    console.error('Error in POST /api/send-invite:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
