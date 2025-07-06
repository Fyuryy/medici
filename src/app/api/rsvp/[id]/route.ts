// src/app/api/rsvp/[id]/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'


type Context = {
  params: {
    id: string
  }
}

export async function GET(
  request: Request,
  ctx: Context,
) {
  const {id} = ctx.params
  if (!id) {
    return NextResponse.json(
      { error: 'Missing invitation id' },
      { status: 400 }
    )
  }

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
