import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail } from '@/utils/email'
import { sendSms } from '@/utils/sms'


export async function POST(request: Request) {
  // 1) get the bearer token
  const authHeader = request.headers.get('authorization') || ''
  const accessToken = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) create a Supabase client scoped to that user
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    }
  )

  // 3) validate session & get user
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser()

  if (sessionError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }



  // 4) check admin rights with your admin key
  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single()


  if (adminError || !adminRow) {
    console.error('Admin check failed:', adminError)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 5) now run your invite logic exactly as before…
  try {
    const { email, phone } = await request.json()
    const event_id = process.env.NEXT_PUBLIC_EVENT_ID
    if (!event_id) {
      return NextResponse.json(
        { error: 'Server configuration error: event ID not set' },
        { status: 500 }
      )
    }
    if (!email) {
      return NextResponse.json(
        { error: 'Missing required field: email' },
        { status: 400 }
      )
    }

    // check existing invite
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('event_id', event_id)
      .eq('email', email)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    let invitationId = existing?.id
    if (!invitationId) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('invitations')
        .insert({ event_id, email, phone })
        .select('id')
        .single()
      if (insertError || !inserted) {
        return NextResponse.json(
          { error: insertError?.message || 'Failed to create invitation' },
          { status: 500 }
        )
      }
      invitationId = inserted.id
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const inviteLink = `${base}/rsvp/${invitationId}`


    const textBody = `
  Chères amies, chers amis,

  Le soleil se couche lentement sur le Léman, et à cette heure suspendue, nous vous convions à un moment rare, au sommet de la Tour Bel-Air.
  Un instant pensé comme une respiration : une parenthèse d’art, de musique et de partage, entre ciel et ville.

  Au programme :
  • Une heure de jazz, porté par des musiciens aux doigts d’or.  
  • Une œuvre qui prendra vie sous vos yeux au fil d’une peinture en direct.  
  • Deux heures d’un DJ set pensé pour célébrer la lumière qui s’éteint, jusqu’aux premières lueurs de la nuit.

  Horaires :
  Début à 17h30  
  Clôture entre 21h30 et 22h

  Participation :
  20 CHF (une contribution plus généreuse est la bienvenue, l’alcool est inclus)

  Tenue :
  Belle et élégante, à l’image du lieu et de l’instant.

  Important :
  Cet événement est strictement confidentiel. Merci de ne pas en parler autour de vous.  
  Pour des raisons évidentes de discrétion et afin d’éviter toute difficulté, votre présence et celle des autres invités doivent rester privées.

  Le nombre de places est limité.

  Avec gratitude,  
  MEDICI

  RSVP ici : ${inviteLink}
  `.trim();

// 2) HTML version
const htmlBody = `
  <p>Chères amies, chers amis,</p>

  <p>
    Le soleil se couche lentement sur le Léman, et à cette heure suspendue, nous vous convions à un moment rare,
    au sommet de la <strong>Tour Bel-Air</strong>.<br>
    Un instant pensé comme une respiration : une parenthèse d’art, de musique et de partage, entre ciel et ville.
  </p>

  <p><strong>Au programme :</strong></p>
  <ul>
    <li>Une heure de jazz, porté par des musiciens aux doigts d’or.</li>
    <li>Une œuvre qui prendra vie sous vos yeux au fil d’une peinture en direct.</li>
    <li>Deux heures d’un DJ set pensé pour célébrer la lumière qui s’éteint, jusqu’aux premières lueurs de la nuit.</li>
  </ul>

  <p><strong>Horaires :</strong><br>
     Début à 17h30<br>
     Clôture entre 21h30 et 22h
  </p>

  <p><strong>Participation :</strong><br>
     20 CHF (une contribution plus généreuse est la bienvenue, l’alcool est inclus)
  </p>

  <p><strong>Tenue :</strong><br>
     Belle et élégante, à l’image du lieu et de l’instant.
  </p>

  <p><strong>Important :</strong><br>
     Cet événement est strictement confidentiel. Merci de ne pas en parler autour de vous.<br>
     Pour des raisons évidentes de discrétion et afin d’éviter toute difficulté, votre présence
     et celle des autres invités doivent rester privées.
  </p>

  <p>Le nombre de places est limité.</p>

  <p>Avec gratitude,<br>MEDICI</p>

  <hr>

  <p style="text-align:center;">
    <a href="${inviteLink}" style="display:inline-block;padding:12px 20px;
       background:#333;color:#fff;text-decoration:none;border-radius:4px;">
      Cliquez ici pour confirmer votre présence
    </a>
  </p>
`.trim();





   await Promise.all([
  sendEmail(
    email,
    "Invitation Medici",
    textBody,
    // 2) Full HTML body
    htmlBody,
  ),
  phone
    ? sendSms(phone, `MEDICI invite: RSVP at ${inviteLink}`)
    : Promise.resolve(),
]);


    return NextResponse.json({ id: invitationId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
