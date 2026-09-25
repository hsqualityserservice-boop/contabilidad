import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/dashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return <Dashboard userName={session.user.name} />
}

export const metadata = {
  title: 'Dashboard | H&S Quality Service',
  description: 'Gestión operativa, flota, reservas y documentos de H&S Quality Service.',
}
