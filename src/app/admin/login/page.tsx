// src/app/admin/login/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="login-container">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        {error && <div className="error">{error}</div>}
      </form>

      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 4rem auto;
          padding: 2rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
        }
        label {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        input {
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          margin-top: 1.5rem;
          padding: 0.75rem;
          font-size: 1rem;
          border: none;
          border-radius: 4px;
          background-color: #0070f3;
          color: white;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error {
          margin-top: 1rem;
          color: #e00;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
