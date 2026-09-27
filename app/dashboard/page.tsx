import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin-dashboard'
import StaffPortal from '@/components/staff-portal'
import ClientPortal from '@/components/client-dashboard'

export const metadata = {
  title: 'Tableau de Bord · H&S Service',
  description: 'Espace personnel pour admin, collaborateurs et clients.',
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const userRole = session.user.role || 'CLIENT'

  if (userRole === 'ADMIN') {
    return <AdminDashboard user={session.user} />
  }

  if (userRole === 'STAFF') {
    return <StaffPortal user={session.user} />
  }

  return <ClientPortal />
}
