import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'

type SignInPageProps = {
  searchParams: Promise<{ recovery?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [session, params] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    searchParams,
  ])
  if (session?.user) redirect('/account')
  return <AuthForm mode="sign-in" initialRecovery={params.recovery === '1'} />
}
