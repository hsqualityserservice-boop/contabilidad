import HSCleaningApp from '@/components/hs-cleaning-app'

export const metadata = { title: 'Connexion — hs-cleaning.ch' }

type Role = 'ADMIN' | 'STAFF' | 'CLIENT'

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const params = await searchParams
  const role = params.role?.toLowerCase()
  const requiredRole: Role | undefined = role === 'admin' ? 'ADMIN' : role === 'staff' ? 'STAFF' : role === 'client' ? 'CLIENT' : undefined

  return <HSCleaningApp requiredRole={requiredRole} />
}
