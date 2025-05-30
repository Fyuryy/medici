import './globals.css'
import { ReactNode } from 'react'
import { SupabaseProvider } from './providers'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>Inauguration MEDICI</title>
      </head>
      <SupabaseProvider>{children}</SupabaseProvider>{' '}
    </html>
  )
}
