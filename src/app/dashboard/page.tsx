// === src/app/dashboard/page.tsx ===
// Force dynamic rendering to ensure cookies are processed
export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function DashboardPage() {
  // Initialize the Supabase SSR client: pass URL and key as first args, then options
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookies() }
  )

  // Retrieve the current user (revalidates the token on every request)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // If there's no user (or token invalid), show login prompt
  if (error || !user) {
    return (
      <div className="p-4">
        <p>Vous devez être connecté pour accéder à ce contenu.</p>
        <Link href="/auth" className="text-blue-600 underline">
          Se connecter
        </Link>
      </div>
    )
  }

  // Protected content for authenticated users
  return (
    <div className="p-4">
      <h1>Bienvenue sur votre tableau de bord, {user.email} !</h1>
      {/* ...more protected content... */}
    </div>
  )
}
