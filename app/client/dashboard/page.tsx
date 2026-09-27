import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import ClientDashboard from '@/components/client-dashboard'

export const metadata = { title: 'Espace client — hs-cleaning.ch' }

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) redirect('/sign-in?role=client')
  if ((session.user as { role?: string }).role !== 'CLIENT') redirect('/dashboard')

  return <ClientDashboard />
}
