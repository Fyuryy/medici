// src/app/api/rsvp/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { EmailAttachment, sendEmail } from '@/utils/email'
import {v4 as uuidv4} from 'uuid'
import QRCode from 'qrcode'


export async function POST(request: Request) {
  try {
    // 1) Parse & validate incoming JSON
    const {
      invitation_id,
      consent,
      name,
      birthdate,
      phone,
      email: formEmail,
    }: {
      invitation_id?: string
      consent?: boolean
      name?: string
      birthdate?: string
      phone?: string
      email?: string
    } = await request.json()

    const missing: string[] = []
    if (!invitation_id) missing.push('invitation_id')
    if (consent === undefined) missing.push('consent')
    if (!name) missing.push('name')
    if (!birthdate) missing.push('birthdate')
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // 2) Fetch the invitation (to verify and get the invitee’s email)
    const { data: invite, error: inviteErr } = await supabaseAdmin
      .from('invitations')
      .select('id, email, phone, used')
      .eq('id', invitation_id)
      .single()

    if (inviteErr || !invite) {
      return NextResponse.json(
        { error: 'Invalid invitation ID.' },
        { status: 400 }
      )
    }
    if (invite.used) {
      return NextResponse.json(
        { error: 'This invitation has already been used.' },
        { status: 400 }
      )
    }

    // 3) Record the RSVP (only consent + invitation_id)
    const { data: rsvp, error: rsvpErr } = await supabaseAdmin
      .from('rsvps')
      .upsert(
        { invitation_id, consent },
        { onConflict: 'invitation_id' }
      ) 
      .select('id')
      .single()

    if (rsvpErr || !rsvp) {
      return NextResponse.json(
        { error: 'Failed to record RSVP.' },
        { status: 500 }
      )
    }



    // 4) Determine which email to register
    const emailToUse = formEmail?.trim() || invite.email
    if (!emailToUse) {
      return NextResponse.json(
        { error: 'No email available for user.' },
        { status: 400 }
      )
    }

    // 5) Create the user record immediately 
    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .insert({
        rsvp_id:       rsvp.id,
        name,
        email:         emailToUse,
        phone:         phone || invite.phone || null,
        date_of_birth: birthdate,
      })
      .select('id')
      .single()

    
    if (userErr || !user) {
      console.error('Error creating user:', userErr)
      return NextResponse.json(
        { error: 'Failed to create user.' },
        { status: 500 }
      )
    }

    const ticketCode = uuidv4()
    await supabaseAdmin
      .from('tickets')
      .insert({
        user_id:     user.id,
        event_id:    process.env.NEXT_PUBLIC_EVENT_ID!,
        ticket_code: ticketCode,
        issued_at:   new Date().toISOString(),
      })

    // mark used…
    await supabaseAdmin
      .from('invitations')
      .update({ used: true })
      .eq('id', invitation_id)

    // Build the ticket link
    const baseUrl    = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const ticketLink = `${baseUrl}/tickets/${ticketCode}`

    // 1) Generate a PNG buffer of the QR  
    const qrBuffer = await QRCode.toBuffer(ticketCode, { type: 'png', width: 256 })

    // 2) Prepare the attachment  
    const attachment: EmailAttachment = {
      content: qrBuffer.toString('base64'),
      filename: 'ticket.png',
      type: 'image/png',
      disposition: 'attachment',
    }

    // 3) Send the email with the QR as attachment
    await sendEmail(
      emailToUse,
      'Your MEDICI Event Ticket 🎫',
      `Thank you for RSVPing! Your ticket is attached as “ticket.png”.`,
      `<p>Thanks for RSVPing, ${name}!</p>
       <p>Please find your ticket attached to this email.</p>
       <p>If you prefer to scan a QR on screen, visit: <a href="${ticketLink}">${ticketLink}</a></p>`,
      [attachment]  // Attach the QR code image         
    )

    return NextResponse.json({ success: true, ticketCode })
  } catch (err) {
    console.error(err)
    const msg = err instanceof Error ? err.message : 'Unexpected server error.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


