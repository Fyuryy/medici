import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function attachFormToInvitation(
  invitationId: string,
  { email, phone }: { email: string; phone?: string }
) {
  const normEmail = email.trim().toLowerCase()
  const { error } = await supabaseAdmin
    .from('invitations')
    .update({ email: normEmail, phone: (phone || '').trim() || null })
    .eq('id', invitationId)
    .eq('used', false)

  if (error) throw new Error('Failed to update invitation with form data')
}
