import Link from 'next/link'
import { ArrowRight, KeyRound } from 'lucide-react'
import { PublicHomeHeader } from '@/components/public-home-header'
import { messages } from '@/lib/i18n'
import { getLocale } from '@/lib/locale-server'

export async function HomeLanding() {
  const locale = await getLocale()
  const t = messages[locale].home
  const auth = messages[locale].auth
  const legalLabels = {
    terms: locale === 'es' ? 'Términos y condiciones' : locale === 'fr' ? 'Conditions générales' : 'Terms and conditions',
    privacy: locale === 'es' ? 'Política de privacidad' : locale === 'fr' ? 'Politique de confidentialité' : 'Privacy policy',
  }

  return (
    <main className="public-home">
      <PublicHomeHeader locale={locale} />

      <section className="public-home-hero public-home-login-only" aria-labelledby="home-title">
        <div className="public-home-copy">
          <p className="auth-eyebrow">{auth.eyebrow}</p>
          <h1 id="home-title">{auth.signInTitle}</h1>
          <p className="public-home-intro">{auth.signInIntro}</p>
          <div className="public-home-actions public-home-auth-actions">
            <Link href="/sign-in" className="public-home-register public-home-primary">{t.login} <ArrowRight aria-hidden="true" /></Link>
            <Link href="/sign-up" className="public-home-create-account">{t.createAccount}</Link>
            <Link href="/sign-in?recovery=1" className="public-home-recovery"><KeyRound aria-hidden="true" />{auth.forgotPassword}</Link>
          </div>
        </div>
      </section>

      <footer className="public-home-legal-footer">
        <Link href="/terms">{legalLabels.terms}</Link>
        <span aria-hidden="true">·</span>
        <Link href="/privacy">{legalLabels.privacy}</Link>
      </footer>
    </main>
  )
}
