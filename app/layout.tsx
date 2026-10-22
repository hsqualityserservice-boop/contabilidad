import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { LanguageProvider } from '@/components/language-provider'
import { getLocale } from '@/lib/locale-server'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const descriptions = {
    es: 'HS Cleaning: solicita servicios de limpieza y gestiona una cuenta particular o profesional en Suiza. hs-cleaning.ch',
    fr: 'HS Cleaning : demandez des prestations de nettoyage et gérez votre compte en Suisse. hs-cleaning.ch',
    en: 'HS Cleaning: request cleaning services and manage your personal or business account in Switzerland. hs-cleaning.ch',
  }
  return {
    metadataBase: new URL('https://hs-cleaning.ch'),
    title: 'HS Cleaning — Quality Service',
    description: descriptions[locale],
    generator: 'v0.app',
    icons: { icon: '/hs-quality-service.png', apple: '/hs-quality-service.png' },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ee791f',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html lang={locale} className="bg-background">
      <body className="antialiased">
        <LanguageProvider initialLocale={locale}>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </LanguageProvider>
      </body>
    </html>
  )
}
