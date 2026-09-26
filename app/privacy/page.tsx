import Link from 'next/link'

export const metadata = {
  title: 'Politique de confidentialité | H&S Quality Service',
  description: 'Informations de confidentialité et de sécurité de H&S Quality Service.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-12">
      <article className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
        <Link href="/" className="text-sm font-semibold text-primary underline underline-offset-4">Retour à la connexion</Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">H&amp;S Quality Service</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Politique de confidentialité &amp; Sécurité (nLPD)</h1>
        </div>
        <p className="leading-7 text-muted-foreground">H&amp;S Quality Service respecte la nouvelle Loi fédérale sur la protection des données (nLPD). Les utilisateurs disposent d&apos;un droit à l&apos;effacement et peuvent résilier leur compte de manière autonome.</p>
        <p className="leading-7 text-muted-foreground">Notre entreprise est assurée contre les dommages causés à des tiers jusqu&apos;à concurrence de 5&apos;000&apos;000 CHF auprès de Baloise Assurances.</p>
        <p className="text-sm text-muted-foreground">Les demandes relatives à vos données peuvent être adressées au support H&amp;S Quality Service.</p>
      </article>
    </main>
  )
}
