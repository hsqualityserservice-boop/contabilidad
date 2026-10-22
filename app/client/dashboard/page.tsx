import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import ClientDashboard from '@/components/client-dashboard'

export const metadata = { title: 'Espace client — H&S Quality Service' }

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in?role=client')
  if ((session.user as { role?: string }).role !== 'CLIENT') redirect('/dashboard')
  return <ClientDashboard />
}
