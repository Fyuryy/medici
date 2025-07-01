// src/app/api/rsvp/[id]/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

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
