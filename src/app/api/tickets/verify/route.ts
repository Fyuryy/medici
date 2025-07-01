// src/app/api/tickets/verify/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin }  from '@/lib/supabaseAdmin'

// 1) Define the shape you actually want:
type TicketWithUser = {
  id: string
  event_id: string
  redeemed_at: string | null
  users: { name: string }
}


export async function POST(request: Request) {
  try {
    // 1) Pull the code out of the request body
    const { ticket_code }: { ticket_code?: string } = await request.json()
    if (!ticket_code) {
      return NextResponse.json(
        { valid: false, error: 'No ticket_code provided' },
        { status: 400 }
      )
    }

    // 2) Look up the ticket
    const resp = await supabaseAdmin
      .from('tickets')
      .select('id, event_id, redeemed_at, users( name )')
      .eq('ticket_code', ticket_code)
      .single()



  if (resp.error) {
    return NextResponse.json(
      { valid: false, error: 'Ticket not found' },
      { status: resp.status }
    )
  }
  const ticket = resp.data! as unknown as TicketWithUser 
  
    // 3) Confirm it belongs to the current event
    if (ticket.event_id !== process.env.NEXT_PUBLIC_EVENT_ID) {
      return NextResponse.json(
        { valid: false, error: 'Wrong event' },
        { status: 400 }
      )
    }

    // // 4) Reject if already redeemed
    // if (ticket.redeemed_at) {
    //   return NextResponse.json(
    //     { valid: false, error: 'Ticket already redeemed' },
    //     { status: 400 }
    //   )
    // }

    // // 5) (Optionally) mark it redeemed now
    // await supabaseAdmin
    //   .from('tickets')
    //   .update({ redeemed_at: new Date().toISOString() })
    //   .eq('id', ticket.id)

    const name   = ticket.users.name  // now TS won’t complain

    
    // 6) Success!
    return NextResponse.json({ valid: true, name })
  } catch (err) {
    let msg = ''
    if (err instanceof Error) {
      msg = err.message
    }else{
      msg = 'An unexpected error occurred.'
    }
    console.error('Error in POST /api/verify:', err)
    return NextResponse.json(
      { error: msg || 'Unexpected server error.' },
      { status: 500 }
    )
  }
}
