import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const allowedEmails = (process.env.ADMIN_EMAILS ?? 'h.squalityserservice@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!allowedEmails.includes(session.user.email.toLowerCase())) redirect('/dashboard')

  return <AdminDashboard userName={session.user.name} userEmail={session.user.email} />
}

export const metadata = {
  title: 'Administration | H&S Quality Service',
  description: 'Administration trilingue du personnel, planning terrain et espace clients.',
}
