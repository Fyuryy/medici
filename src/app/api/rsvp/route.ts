// src/app/api/rsvp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: NextRequest) {
  // 1) Parse and validate request body
  const body = await request.json()
  const invitationId = body.invitation_id as string | undefined
  const consent = body.consent as boolean | undefined
  const name = body.name as string | undefined
  const birthdate = body.birthdate as string | undefined
  const phone = body.phone as string | undefined

  const missingFields: string[] = []
  if (!invitationId) missingFields.push('invitation_id')
  if (!name)         missingFields.push('name')
  if (!birthdate)    missingFields.push('birthdate')
  if (missingFields.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(', ')}` },
      { status: 400 }
    )
  }

  // 2) Verify invitation
  const { data: invite, error: inviteErr } = await supabaseAdmin
    .from('invitations')
    .select('id, email, phone, used, event_id')
    .eq('id', invitationId)
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

  // 3) Upsert RSVP
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
    return NextResponse.json(
      { error: 'Failed to record RSVP.' },
      { status: 500 }
    )
  }

  // 4) Upsert user profile
  const { data: user, error: userErr } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        rsvp_id:        invitationId,
        name,
        email:          invite.email,
        phone:          phone ?? invite.phone ?? null,
        date_of_birth:  birthdate,
      },
      { onConflict: 'email' }
    )
    .select('id')
    .single()
  if (userErr || !user) {
    console.error('User upsert error:', userErr)
    return NextResponse.json(
      { error: 'Failed to create or update user.' },
      { status: 500 }
    )
  }

  console.log("Added user: ", name, " with ID: ", user.id)

  // 5) Determine priceId
  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    console.error('Missing STRIPE_PRICE_ID in environment')
    return NextResponse.json(
      { error: 'Ticket price not configured.' },
      { status: 500 }
    )
  }

  // 6) Build origin and session params
  const originHeader = request.headers.get('origin')
  const origin = originHeader ?? process.env.NEXT_PUBLIC_APP_URL!

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items:          [{ price: priceId, quantity: 1 }],
    mode:                'payment',
    success_url:         `${origin}/stripe/success?id=${invitationId}`,
    cancel_url:          `${origin}/stripe/cancel?id=${invitationId}`,
    metadata: {
      invitation_id: invitationId as string,
      rsvp_id:       rsvp.id.toString(),
      user_id:       user.id.toString(),
      email:         invite.email,
      event_id:      invite.event_id,
    },
  }

  // 7) Create Stripe Checkout Session
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create(sessionParams)
    console.log('CREATED SESSION METADATA:', session.metadata)
  } catch (err) {
    console.error('Stripe Checkout creation failed', err)
    return NextResponse.json(
      { error: 'Unable to initiate payment.' },
      { status: 500 }
    )
  }

  // 8) Return session ID
  return NextResponse.json({ sessionId: session.id })
}
