import '../styles/globals.css'
import { ReactNode } from 'react'
import { SupabaseProvider } from './providers'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto',
})

// app/layout.js
export const metadata = {
  title: 'Medici Studio',
  icons: {
    icon: '/LOGO_MEDICI_BLANC.png', 
    shortcut: '/LOGO_MEDICI_BLANC.png', 
    apple: '/LOGO_MEDICI_BLANC.png',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={roboto.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Inauguration MEDICI</title>
      </head>

      <body>
        <SupabaseProvider>{children}</SupabaseProvider>{' '}
      </body>
    </html>
  )
}
