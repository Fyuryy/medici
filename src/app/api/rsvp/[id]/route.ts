// src/app/api/rsvp/[id]/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

interface ContextParams {
  params: {
    id: string
  }
}

interface Invitation {
  email: string
  phone: string
  used: boolean
}

interface SupabaseResponse {
  data: Invitation | null
  error: { message: string } | null
}

export async function GET(request: Request, context: ContextParams): Promise<NextResponse> {
  // context.params exists and has your dynamic segments
  const id = context.params.id
  const { data, error }: SupabaseResponse = await supabaseAdmin
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
