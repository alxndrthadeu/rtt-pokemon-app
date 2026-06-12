import type { Metadata } from 'next'
import { Press_Start_2P } from 'next/font/google'
import { ApiErrorBanner } from '@/components/ApiErrorBanner'
import './globals.css'

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
})

export const metadata: Metadata = {
  title: 'Pokémon: Reach the Top',
  description: 'RPG tático de cartas — escale a torre dos ginásios de Kanto',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={pressStart.variable}>
      <body className="min-h-screen bg-parchment text-ink antialiased">
        <ApiErrorBanner />
        {children}
      </body>
    </html>
  )
}
