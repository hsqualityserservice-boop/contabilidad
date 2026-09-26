import AuthForm from '@/components/auth-form'

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5">
      <AuthForm />
    </main>
  )
}

export async function generateMetadata() {
  return {
    title: 'Connexion | H&S Quality Service',
    description: 'Accès sécurisé aux espaces H&S Quality Service.',
  }
}
