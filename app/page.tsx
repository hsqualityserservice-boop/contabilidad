import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  redirect(session?.user ? '/dashboard' : '/sign-in')
}

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return {
    title: 'Connexion | H&S Quality Service',
    description: 'Accès sécurisé aux espaces H&S Quality Service.',
  }
}
