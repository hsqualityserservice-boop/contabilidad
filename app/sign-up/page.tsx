import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AuthForm from '@/components/auth-form'

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fa] px-4 py-10">
      <AuthForm mode="sign-up" />
    </main>
  )
}
