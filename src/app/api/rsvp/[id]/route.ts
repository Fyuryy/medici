// src/app/api/rsvp/[id]/route.ts

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Missing invitation id' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('invitations')
    .select('id,email,phone,created_at,used,event_id')
    .eq('id', id)
    .maybeSingle() // ← avoids PGRST116 when not found

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
