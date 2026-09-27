import AuthForm from '@/components/auth-form'

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-5">
      <AuthForm />
      <footer className="flex max-w-md flex-col items-center gap-2 text-center text-xs leading-5 text-muted-foreground">
        <p>Acceso oficial para clientes particulares y empresas.</p>
        <a href="/privacy" className="font-medium underline underline-offset-4">Política de privacidad y seguridad</a>
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
