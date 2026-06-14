import type { Metadata } from 'next'
import { Press_Start_2P } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ApiErrorBanner } from '@/components/ApiErrorBanner'
import './globals.css'

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://pokemon-rtt.vercel.app'),
  title: 'Pokémon: Reach the Top',
  description: 'RPG tático de cartas — escale a torre dos ginásios de Kanto',
  openGraph: {
    title: 'Pokémon: Reach the Top',
    description: 'RPG tático de cartas — escale a torre dos ginásios de Kanto',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokémon: Reach the Top',
    description: 'RPG tático de cartas — escale a torre dos ginásios de Kanto',
    images: ['/api/og'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={pressStart.variable}>
      <body className="min-h-screen bg-parchment text-ink antialiased">
        <ApiErrorBanner />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
