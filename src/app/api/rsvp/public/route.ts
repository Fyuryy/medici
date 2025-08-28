// src/app/api/rsvp/public/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { v4 as uuidv4 } from 'uuid'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: NextRequest) {
  // 1) Parse and validate request body
  const body = await request.json()
  const consent = body.consent as boolean | undefined
  const name = body.name as string | undefined
  const birthdate = body.birthdate as string | undefined
  const phone = body.phone as string | undefined
  const emailRaw = body.email as string | undefined

  const missing: string[] = []
  if (!name) missing.push('name')
  if (!birthdate) missing.push('birthdate')
  if (!emailRaw) missing.push('email')
  if (!phone) missing.push('phone')
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    )
  }
  const providedEmail = emailRaw!.trim().toLowerCase()

  // 2) Check if user already exists
  const { data: existingUser, error: userCheckError } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('email', providedEmail)
    .maybeSingle()

  if (userCheckError) {
    console.error('User check error:', userCheckError)
    return NextResponse.json({ error: 'Failed to check existing user.' }, { status: 500 })
  }

  if (existingUser) {
    return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 })
  }

  // 3) Create a unique invitation ID for this public registration
  const invitationId = uuidv4()

  // 4) Create invitation record
  const { data: invite, error: inviteErr } = await supabaseAdmin
    .from('invitations')
    .insert({
      id: invitationId,
      email: providedEmail,
      phone: phone,
      event_id: process.env.NEXT_PUBLIC_EVENT_ID,
      used: false,
    })
    .select('id')
    .single()

  if (inviteErr || !invite) {
    console.error('Invitation creation error:', inviteErr)
    return NextResponse.json({ error: 'Failed to create invitation.' }, { status: 500 })
  }

  // 5) Upsert RSVP
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

  // 6) Create user profile
  const { data: user, error: userErr } = await supabaseAdmin
    .from('users')
    .insert({
      rsvp_id: invitationId,
      name,
      email: providedEmail,
      phone: phone,
      date_of_birth: birthdate,
    })
    .select('id')
    .single()

  if (userErr || !user) {
    console.error('User creation error:', userErr)
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 })
  }

  // 7) Determine price
  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    console.error('Missing STRIPE_PRICE_ID in environment')
    return NextResponse.json({ error: 'Ticket price not configured.' }, { status: 500 })
  }

  // 8) Origin + session params
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
      invitation_id: invitationId,
      rsvp_id: String(rsvp.id),
      user_id: String(user.id),
      email: providedEmail,
      event_id: process.env.NEXT_PUBLIC_EVENT_ID!,
    },
  }

  // 9) Create Stripe Checkout Session
  try {
    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ sessionId: session.id })
  } catch (err) {
    console.error('Stripe Checkout creation failed', err)
    return NextResponse.json({ error: 'Unable to initiate payment.' }, { status: 500 })
  }
} 