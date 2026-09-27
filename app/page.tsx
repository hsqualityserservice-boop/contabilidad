import HSCleaningApp from '@/components/hs-cleaning-app'

export const metadata = {
  title: 'hs-cleaning.ch — Espace client & opérations',
  description: 'La plateforme suisse de H&S Quality Service pour piloter vos interventions, équipes et factures.',
}

export default function Page() {
  return <HSCleaningApp />
}

export const dynamic = 'force-static'

// The app is intentionally self-contained for this clean hs-cleaning.ch foundation.
// Production auth and persistence can be connected to the existing project services next.

