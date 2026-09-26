import AuthForm from '@/components/auth-form'

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-5">
      <AuthForm />
      <footer className="max-w-md text-center text-xs leading-5 text-muted-foreground">
        <a href="/privacy" className="font-medium underline underline-offset-4">Politique de confidentialité &amp; Sécurité (nLPD)</a>
      </footer>
    </main>
  )
}

export async function generateMetadata() {
  return {
    title: 'Connexion | H&S Quality Service',
    description: 'Accès sécurisé aux espaces H&S Quality Service.',
  }
}
