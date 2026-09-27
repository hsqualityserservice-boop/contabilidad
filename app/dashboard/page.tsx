import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin-dashboard'
import Dashboard from '@/components/dashboard'
import { getCustomerProfile } from '@/app/actions/customer-profile'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const adminEmail = 'h.squalityserservice@gmail.com'
  if (session.user.email.toLowerCase() === adminEmail) {
    return <AdminDashboard userName={session.user.name} userEmail={session.user.email} />
  }

  const customerProfile = await getCustomerProfile()
  return <Dashboard userName={session.user.name} initialSection="client" customerProfile={customerProfile} />
}

export const metadata = {
  title: 'Administration | H&S Quality Service',
  description: 'Administration trilingue du personnel, planning terrain et espace clients.',
}
