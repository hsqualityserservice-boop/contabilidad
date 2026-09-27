import HSCleaningApp from '@/components/hs-cleaning-app'
export const metadata = { title: 'Administration — hs-cleaning.ch' }
export default function Page() { return <HSCleaningApp requiredRole="ADMIN" /> }
