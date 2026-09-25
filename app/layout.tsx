import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'H&S Quality Service — Espace sécurisé',
  description: 'Gestion des interventions, planning et espaces sécurisés de H&S Quality Service.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" className="bg-background"><body>{children}</body></html>
}
