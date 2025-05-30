// === src/app/api/rsvp/route.ts ===
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';

  const { data, error } = await supabase
    .from('invitations')
    .select('invited_name, email')
    .eq('token', token)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ invited: data });
}

export async function POST(request: Request) {
  const { token, firstName, lastName, email, phone, dob, consent } = await request.json();

  const { data: invite } = await supabase
    .from('invitations')
    .select('id')
    .eq('token', token)
    .single();

  if (!invite) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 400 });
  }

  const { error } = await supabase.from('rsvps').insert({
    invitation_id: invite.id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    dob,
    consent,
  });

  if (error) {
    return NextResponse.json({ error: 'Échec confirmation' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
