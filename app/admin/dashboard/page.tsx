import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import AdminDashboard from '@/components/admin-dashboard'

export const metadata = { title: 'Administration — hs-cleaning.ch' }

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) redirect('/sign-in?role=admin')
  if ((session.user as { role?: string }).role !== 'ADMIN') redirect('/dashboard')

  return <AdminDashboard user={session.user} />
}
