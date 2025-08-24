// src/app/api/rsvp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { attachFormToInvitation } from '@/lib/helper' // keep your existing helper

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: NextRequest) {
  // 1) Parse and validate request body (now requires email)
  const body = await request.json()
  const invitationId = body.invitation_id as string | undefined
  const consent      = body.consent as boolean | undefined
  const name         = body.name as string | undefined
  const birthdate    = body.birthdate as string | undefined
  const phone        = body.phone as string | undefined
  const emailRaw     = body.email as string | undefined  // <-- required

  const missing: string[] = []
  if (!invitationId) missing.push('invitation_id')
  if (!name)         missing.push('name')
  if (!birthdate)    missing.push('birthdate')
  if (!emailRaw)     missing.push('email')
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    )
  }
  const providedEmail = emailRaw!.trim().toLowerCase()

  // 2) Load invitation
  const { data: invite, error: inviteErr } = await supabaseAdmin
    .from('invitations')
    .select('id, email, phone, used, event_id')
    .eq('id', invitationId)
    .maybeSingle()

  if (inviteErr || !invite) {
    return NextResponse.json({ error: 'Invalid invitation ID.' }, { status: 400 })
  }
  if (invite.used) {
    return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 400 })
  }

  // 3) Bind this invitation to the submitted email (override placeholders or legacy values)
  try {
    await attachFormToInvitation(invitationId as string, {
      email: providedEmail,
      phone: phone ?? invite.phone ?? '',
    })
  } catch (e) {
    console.error('Failed to update invitation email/phone:', e)
    return NextResponse.json({ error: 'Failed to update invitation.' }, { status: 500 })
  }

  // 4) Upsert RSVP (idempotent on invitation_id)
  const { data: rsvp, error: rsvpErr } = await supabaseAdmin
    .from('rsvps')
    .upsert(
      { invitation_id: invitationId, consent: consent ?? false },
      { onConflict: 'invitation_id' }
    )
    .select('id')
    .single()

  if (rsvpErr || !rsvp) {
    console.error('RSVP error:', rsvpErr)
    return NextResponse.json({ error: 'Failed to record RSVP.' }, { status: 500 })
  }

  // 5) Upsert user profile (conflict on email)
  const { data: user, error: userErr } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        rsvp_id:       invitationId,
        name,
        email:         providedEmail,      // use the just-bound email
        phone:         phone ?? invite.phone ?? null,
        date_of_birth: birthdate,
      },
      { onConflict: 'email' }
    )
    .select('id')
    .single()

  if (userErr || !user) {
    console.error('User upsert error:', userErr)
    return NextResponse.json({ error: 'Failed to create or update user.' }, { status: 500 })
  }

  // 6) Determine price
  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    console.error('Missing STRIPE_PRICE_ID in environment')
    return NextResponse.json({ error: 'Ticket price not configured.' }, { status: 500 })
  }

  // 7) Origin + session params
  const originHeader = request.headers.get('origin')
  const origin = originHeader ?? process.env.NEXT_PUBLIC_BASE_URL!

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card', 'twint'],
    line_items: [
      {
        price_data: {
          currency: 'chf',
          product_data: { name: 'Entry ticket' },
          unit_amount: 2500, // 25 CHF
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/stripe/success/${invitationId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/stripe/cancel/${invitationId}`,
    metadata: {
      invitation_id: invitationId as string,
      rsvp_id: String(rsvp.id),
      user_id: String(user.id),
      email: providedEmail,        // consistent with the bound invite
      event_id: invite.event_id,
    },
  }

  // 8) Create Stripe Checkout Session
  try {
    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ sessionId: session.id })
  } catch (err) {
    console.error('Stripe Checkout creation failed', err)
    return NextResponse.json({ error: 'Unable to initiate payment.' }, { status: 500 })
  }
}
