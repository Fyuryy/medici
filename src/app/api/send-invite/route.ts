// src/app/api/send-invite/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail } from '@/utils/email'
import { sendSms } from '@/utils/sms'

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json()

    // 1) Ensure event ID is configured
    const event_id = process.env.NEXT_PUBLIC_EVENT_ID
    if (!event_id) {
      console.error('EVENT_ID is not defined')
      return NextResponse.json(
        { error: 'Server configuration error: event ID not set' },
        { status: 500 }
      )
    }

    // 2) Validate required field
    if (!email) {
      return NextResponse.json(
        { error: 'Missing required field: email' },
        { status: 400 }
      )
    }

    // 3) Check for an existing invitation
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('event_id', event_id)
      .eq('email', email)
      .single()

    // PGRST116 means “no rows found” — ignore that
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing invite:', fetchError)
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // 4) Insert or reuse
    let invitationId: string
    if (existing) {
      invitationId = existing.id
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('invitations')
        .insert(
          { event_id, email, phone }
        )
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

    // 5) Build link and send
    const base =
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const inviteLink = `${base}/rsvp/${invitationId}`

    await Promise.all([
      sendEmail(
        email,
        "You're invited to MEDICI 🎉",
        `Please RSVP: ${inviteLink}`,
        `<p>Please <a href="${inviteLink}">click here</a> to RSVP to our event.</p>`
      ),
      phone
        ? sendSms(
            phone,
            `MEDICI invite: RSVP at ${inviteLink}`
          )
        : Promise.resolve(),
    ])

    return NextResponse.json({ id: invitationId })
  } catch (err) {
    let msg = ''
    if (err instanceof Error) {
      msg = err.message
    }else{
      msg = 'An unexpected error occurred.'
    }
    console.error('Error in POST /api/send-invite:', err)
    return NextResponse.json(
      { error: msg || 'Unexpected server error.' },
      { status: 500 }
    )
  }
}
