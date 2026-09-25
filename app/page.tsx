import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AuthForm from '@/components/auth-form'

const accessProfiles = [
  {
    email: 'h.squalityserservice@gmail.com',
    role: 'ADMIN',
    description: 'Gestion française des fiches de salaire AVS et des codes personnels.',
  },
  {
    email: 'h.squalityservice@gmail.com',
    role: 'STAFF',
    description: 'Espace opérationnel français avec Clock-In / Clock-Out.',
  },
  {
    email: 'rhur.91@gmail.com',
    role: 'CLIENT',
    description: 'Calcul libre et nouveau calendrier des heures préférées.',
  },
]

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-10 text-[#152238] sm:px-8 sm:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <section className="max-w-xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#c1121f] text-xl font-bold text-white">H&S</div>
            <div>
              <p className="text-lg font-bold tracking-tight">H&S Quality Service</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Nettoyage professionnel</p>
            </div>
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#c1121f]">Espace sécurisé</p>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">Bienvenue dans votre espace H&S.</h1>
          <p className="mt-5 max-w-lg text-pretty text-base leading-7 text-slate-600">Connectez-vous pour accéder à l'espace correspondant à votre rôle professionnel.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {accessProfiles.map((profile) => (
              <article key={profile.email} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold tracking-[0.12em] text-[#c1121f]">{profile.role}</p>
                <p className="mt-2 break-words text-xs font-semibold text-slate-700">{profile.email}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{profile.description}</p>
              </article>
            ))}
          </div>
        </section>
        <AuthForm />
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return {
    title: 'Connexion | H&S Quality Service',
    description: 'Accès sécurisé aux espaces H&S Quality Service.',
  }
}
