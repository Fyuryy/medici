// src/app/api/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { buffer } from 'micro'
import QRCode from 'qrcode'
import { sendEmail, EmailAttachment } from '@/utils/email'

export const runtime = 'nodejs'
export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(req: NextRequest) {
  // 1) Verify webhook
  const sig = req.headers.get('stripe-signature')!
  const buf = await buffer(req)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Invalid Stripe signature', err)
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  // 2) Only handle completed checkouts
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta    = session.metadata as Record<string, string>

    // pull out what your tickets route needs
    const payload = {
      user_id:       meta.user_id!,
      event_id:      meta.event_id!,       // make sure you set this in metadata
      invitation_id: meta.invitation_id!,
      session_id:    session.id,
    }

    // 3) Call your `/api/tickets` endpoint
    const base = process.env.NEXT_PUBLIC_BASE_URL!
    const ticketsRes = await fetch(`${base}/api/tickets`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    if (!ticketsRes.ok) {
      console.error('Ticket API failed', await ticketsRes.text())
      return NextResponse.json({ message: 'Ticket API error' }, { status: 500 })
    }

    const { ticket_code } = await ticketsRes.json()

    // 4) Generate QR & email
    const qrBuffer: Buffer = await QRCode.toBuffer(ticket_code, {
      type: 'png',
      width: 256,
    })
    const attachment: EmailAttachment = {
      content:    qrBuffer.toString('base64'),
      filename:   'ticket.png',
      type:       'image/png',
      disposition:'attachment',
    }

    // fetch invitee email or include it in your tickets API response
    const emailTo = meta.email!  

    await sendEmail(
      emailTo,
      'Your MEDICI Ticket',
      'Thanks for your purchase—here is your ticket!',
      `<p>Your code is <strong>${ticket_code}</strong>.</p>`,
      [attachment],
    )
  }

  return NextResponse.json({ received: true })
}
