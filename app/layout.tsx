import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'hs-cleaning.ch — Espace client & opérations',
  description: 'La plateforme suisse de H&S Quality Service pour piloter vos interventions, équipes et factures.',
  metadataBase: new URL('https://hs-cleaning.ch'),
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" className="bg-background"><body className="min-h-screen font-sans">{children}</body></html>
}
