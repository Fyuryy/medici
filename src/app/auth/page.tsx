'use client'

import {
  useSupabaseClient,
  useSession,
  useUser,
} from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function AuthPage() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const user = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Sign up or sign in flows
  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Vérifiez votre email pour confirmer le lien magique !')
  }

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) alert(error.message)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (session) {
    return (
      <div className="p-4">
        <p>Connecté en tant que {user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Se déconnecter
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold">Connexion / Inscription</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <div className="flex space-x-2">
        <button
          onClick={handleLogin}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Se connecter
        </button>
        <button
          onClick={handleSignup}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded"
        >
          S’inscrire
        </button>
      </div>
    </div>
  )
}
