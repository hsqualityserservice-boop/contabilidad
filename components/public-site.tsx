'use client'

import Link from 'next/link'
import { useState } from 'react'

const copy = {
  FR: { nav1: 'Nos services', nav2: 'Société & dons', login: 'Espace client', title: 'Un service de nettoyage qui prend soin de chaque détail.', text: 'H&S Service Sàrl accompagne les entreprises et les particuliers en Suisse romande avec des équipes fiables, des produits écologiques et une couverture Baloise de CHF 5’000’000.', cta: 'Découvrir nos services', trust: 'Une qualité suisse, une responsabilité concrète.' },
  ES: { nav1: 'Nuestros servicios', nav2: 'Sociedad y donaciones', login: 'Espacio cliente', title: 'Un servicio de limpieza que cuida cada detalle.', text: 'H&S Service Sàrl acompaña a empresas y particulares en la Suiza francófona con equipos fiables, productos ecológicos y cobertura Baloise de 5.000.000 CHF.', cta: 'Descubrir nuestros servicios', trust: 'Calidad suiza, responsabilidad concreta.' },
  EN: { nav1: 'Our services', nav2: 'Company & giving', login: 'Client space', title: 'A cleaning service that cares about every detail.', text: 'H&S Service Sàrl supports companies and households in French-speaking Switzerland with reliable teams, ecological products and CHF 5,000,000 Baloise coverage.', cta: 'Discover our services', trust: 'Swiss quality, concrete responsibility.' },
} as const

export default function PublicSite({ page = 'home' }: { page?: 'home' | 'services' | 'donations' }) {
  const [lang, setLang] = useState<keyof typeof copy>('FR')
  const t = copy[lang]
  const title = page === 'services' ? t.nav1 : page === 'donations' ? t.nav2 : t.title
  return <main className="public-site"><header className="public-header"><Link className="public-brand" href="/"><img src="/hs-logo.png" alt="H&S Quality Service" /><span>H&amp;S QUALITY SERVICE</span></Link><nav><Link href="/trajectory-services">{t.nav1}</Link><Link href="/societe-dons">{t.nav2}</Link><Link className="public-login" href="/client/dashboard">{t.login}</Link></nav><div className="public-languages">{(['FR', 'ES', 'EN'] as const).map((item) => <button key={item} className={lang === item ? 'active' : ''} onClick={() => setLang(item)}>{item}</button>)}</div></header><section className="public-hero"><div><p className="eyebrow">H&S SERVICE SÀRL · SUISSE ROMANDE</p><h1>{title}</h1><p className="public-lead">{page === 'home' ? t.text : t.trust}</p><Link className="public-cta" href={page === 'home' ? '/trajectory-services' : '/client/dashboard'}>{t.cta}</Link></div><aside className="public-trust"><strong>CHF 5’000’000</strong><span>Garantie responsabilité civile<br />Baloise Assurances</span></aside></section><footer className="public-footer"><span>Genève · Vaud · Neuchâtel · Valais</span><span>© 2026 H&S Service Sàrl</span></footer></main>
}

