import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import CleaningPlatform from '@/app/cleaning-platform'
import { getOperationsServiceRequests } from '@/app/actions/account'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function WorkspacePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [profile] = await db
    .select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (profile?.role !== 'admin' || profile.status !== 'active') redirect('/account')

  const serviceRequests = await getOperationsServiceRequests()

  return <CleaningPlatform displayName={session.user.name} serviceRequests={serviceRequests ?? []} />
}
