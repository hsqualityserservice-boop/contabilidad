'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Building2, Globe2, ShieldCheck, UserRound, UsersRound } from 'lucide-react'

const copy = {
  FR: { client: 'Espace Client', staff: 'Espace Collaborateur', admin: 'Espace Administration', signup: 'Créer un compte', login: 'Accéder', tagline: 'H&S Service Sàrl', regions: 'Suisse romande' },
  ES: { client: 'Espacio Cliente', staff: 'Espacio Colaborador', admin: 'Espacio Administración', signup: 'Crear una cuenta', login: 'Acceder', tagline: 'H&S Service Sàrl', regions: 'Suiza francófona' },
  EN: { client: 'Client Space', staff: 'Collaborator Space', admin: 'Administration Space', signup: 'Create an account', login: 'Access', tagline: 'H&S Service Sàrl', regions: 'French-speaking Switzerland' },
} as const

type Language = keyof typeof copy

export default function PublicSite() {
  const [language, setLanguage] = useState<Language>('FR')
  const t = copy[language]

  const portals = [
    { label: t.client, detail: 'Genève · Vaud · Neuchâtel · Valais', icon: UserRound },
    { label: t.staff, detail: 'Clock-In / Clock-Out · Photos terrain', icon: UsersRound },
    { label: t.admin, detail: 'Personnel · Planning · Factures QR', icon: Building2 },
  ]

  return (
    <main className="access-screen">
      <header className="access-header">
        <Link className="access-brand" href="/" aria-label="H&S Service Sàrl">
          <img src="/hs-logo.png" alt="H&S Service Sàrl" />
          <span>H&amp;S<br /><strong>SERVICE SÀRL</strong></span>
        </Link>
        <div className="access-header-actions">
          <Globe2 aria-hidden="true" />
          <div className="access-languages" aria-label="Language selector">
            {(['FR', 'ES', 'EN'] as const).map((item) => (
              <button key={item} className={language === item ? 'active' : ''} onClick={() => setLanguage(item)}>{item}</button>
            ))}
          </div>
        </div>
      </header>

      <section className="access-content" aria-labelledby="access-title">
        <div className="access-intro">
          <p className="access-kicker">{t.tagline}</p>
          <h1 id="access-title">{language === 'FR' ? 'Choisissez votre espace' : language === 'ES' ? 'Elige tu espacio' : 'Choose your space'}</h1>
          <p>{t.regions}</p>
        </div>
        <div className="portal-grid">
          {portals.map(({ label, detail, icon: Icon }) => (
            <Link className="portal-card" href="/sign-in" key={label}>
              <span className="portal-icon"><Icon aria-hidden="true" /></span>
              <span className="portal-copy"><strong>{label}</strong><small>{detail}</small></span>
              <ArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
        <Link className="access-signup" href="/sign-up">{t.signup}<ArrowRight aria-hidden="true" /></Link>
      </section>

      <footer className="access-footer">
        <span>Av. du Simplon 9 · 1225 Chêne-Bourg</span>
        <span><ShieldCheck aria-hidden="true" /> Baloise · CHF 5’000’000</span>
      </footer>
    </main>
  )
}

export { copy }
