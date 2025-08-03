// app/layout.tsx
import '../styles/globals.css'
import { ReactNode } from 'react'
import { SupabaseProvider } from './providers'
import { Roboto } from 'next/font/google'
import { Metadata } from 'next'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'Medici Studio',
  // viewport can be a string in Next 13.4+
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/LOGO_MEDICI_BLANC.ico', // all modern browsers
    shortcut: '/LOGO_MEDICI_BLANC.ico', // legacy support
    apple: '/LOGO_MEDICI_BLANC.ico', // iOS home-screen
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={roboto.className}>
      {/* Next will auto-inject your <title> and <link rel="icon"> here */}
      <head />
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  )
}
