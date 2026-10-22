import LandingPublic from '@/components/landing-public'

export const metadata = {
  title: 'Nettoyage professionnel à Genève | H&S Quality Service',
  description:
    'Entreprise de nettoyage à Genève : fin de bail garantie, bureaux, cabinets médicaux, vitrines et Airbnb. Devis immédiat en ligne. Assurance RC CHF 5M. Suisse romande.',
  openGraph: {
    title: 'H&S Quality Service — Nettoyage professionnel à Genève',
    description: 'Fin de bail garantie · Bureaux · Cabinets médicaux · Devis immédiat en ligne.',
    url: 'https://hs-cleaning.ch',
    siteName: 'H&S Quality Service',
    locale: 'fr_CH',
    type: 'website',
  },
  alternates: { canonical: 'https://hs-cleaning.ch' },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'H&S Quality Service Sàrl',
            url: 'https://hs-cleaning.ch',
            image: 'https://hs-cleaning.ch/hs-logo.png',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Av. du Simplon 9',
              postalCode: '1225',
              addressLocality: 'Chêne-Bourg',
              addressRegion: 'Genève',
              addressCountry: 'CH',
            },
            areaServed: ['Genève', 'Vaud', 'Neuchâtel', 'Valais'],
            priceRange: 'CHF',
            openingHours: 'Mo-Sa 07:00-19:00',
          }),
        }}
      />
      <LandingPublic />
    </>
  )
}
