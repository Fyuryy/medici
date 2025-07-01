// src/app/api/rsvp/[id]/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  // await the params promise before destructuring
  const { id } = await context.params

  const { data, error } = await supabaseAdmin
    .from('invitations')
    .select('email, phone, used')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'Invitation not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}
