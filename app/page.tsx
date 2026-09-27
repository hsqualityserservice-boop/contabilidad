import PublicSite from '@/components/public-site'

export const metadata = {
  title: 'hs-cleaning.ch — Espace client & opérations',
  description: 'La plateforme suisse de H&S Quality Service pour piloter vos interventions, équipes et factures.',
}

export default function Page() {
  return <PublicSite />
}

export const dynamic = 'force-static'

// The app is intentionally self-contained for this clean hs-cleaning.ch foundation.
// Production auth and persistence can be connected to the existing project services next.

