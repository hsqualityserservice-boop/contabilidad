import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, Home, ShieldCheck } from 'lucide-react'
import { PublicHomeHeader } from '@/components/public-home-header'
import { messages } from '@/lib/i18n'
import { getLocale } from '@/lib/locale-server'

export default async function LandingPublic() {
  const locale = await getLocale()
  const t = messages[locale].home
  const portalLinks = [
    { title: t.private, copy: t.privateCopy, href: '/sign-in?role=client', icon: Home },
    { title: t.professional, copy: t.professionalCopy, href: '/sign-in?role=client', icon: BriefcaseBusiness },
    { title: t.team, copy: t.teamCopy, href: '/sign-in?role=staff', icon: ShieldCheck },
  ]
  const legalLabels = {
    terms: locale === 'es' ? 'Términos y condiciones' : locale === 'fr' ? 'Conditions générales' : 'Terms and conditions',
    privacy: locale === 'es' ? 'Política de privacidad' : locale === 'fr' ? 'Politique de confidentialité' : 'Privacy policy',
  }

  return (
    <main className="public-home">
      <PublicHomeHeader locale={locale} />
      <section className="public-home-hero" aria-labelledby="home-title">
        <div className="public-home-copy">
          <p className="auth-eyebrow">{t.kicker}</p>
          <h1 id="home-title">{t.title}</h1>
          <p className="public-home-intro">{t.intro}</p>
          <div className="public-home-actions">
            <Link href="/sign-in" className="public-home-primary">{t.login} <ArrowRight aria-hidden="true" /></Link>
            <Link href="/sign-up" className="public-home-create-account">{t.createAccount}</Link>
          </div>
        </div>
        <aside className="public-home-aside" aria-label={t.accountSpaces}>
          <p className="auth-eyebrow">{t.accountAccess}</p>
          <h2>{t.asideTitle}</h2>
          <p>{t.asideCopy}</p>
          <div className="public-home-portals">
            {portalLinks.map(({ title, copy, href, icon: Icon }) => (
              <Link key={title} href={href} className="public-home-portal">
                <Icon aria-hidden="true" />
                <span><strong>{title}</strong><small>{copy}</small></span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </aside>
      </section>
      <footer className="public-home-legal-footer">
        <span>{t.footer}</span>
        <span className="public-home-legal-links"><Link href="/terms">{legalLabels.terms}</Link><span aria-hidden="true">·</span><Link href="/privacy">{legalLabels.privacy}</Link></span>
      </footer>
    </main>
  )
}
