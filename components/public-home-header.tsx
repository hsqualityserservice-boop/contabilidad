'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { SignOutButton } from '@/components/sign-out-button'
import type { Locale } from '@/lib/i18n'

const menuCopy = {
  es: { services: 'Servicios', about: 'Sobre nosotros', reviews: 'Opiniones', help: 'Ayuda', careers: 'Carrera', gifts: 'Bonos regalo', brand: 'HS Cleaning', account: 'Acceder a mi cuenta', close: 'Cerrar menú', open: 'Abrir menú', navigation: 'Navegación principal' },
  fr: { services: 'Services', about: 'À propos', reviews: 'Avis', help: 'Aide', careers: 'Carrière', gifts: 'Bons cadeaux', brand: 'HS Cleaning', account: 'Accéder à mon compte', close: 'Fermer le menu', open: 'Ouvrir le menu', navigation: 'Navigation principale' },
  en: { services: 'Services', about: 'About', reviews: 'Reviews', help: 'Help', careers: 'Careers', gifts: 'Gift cards', brand: 'HS Cleaning', account: 'Sign in to my account', close: 'Close menu', open: 'Open menu', navigation: 'Main navigation' },
} satisfies Record<Locale, Record<string, string>>

export function PublicHomeHeader({ locale, accountMode = false, accountTitle }: { locale: Locale; accountMode?: boolean; accountTitle?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const copy = menuCopy[locale]
  const menuItems = [
    { label: copy.services, href: accountMode ? '/account#client-new-quote' : '/sign-up' },
    { label: copy.about, href: '/#home-title' },
    { label: copy.reviews, href: '/#home-title' },
    { label: copy.help, href: '/terms' },
    { label: copy.careers, href: '/sign-up' },
    { label: copy.gifts, href: '/sign-up' },
  ]

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  return (
    <>
      <header className={accountMode ? 'auth-topline account-menu-topline' : 'public-home-header'}>
        <Link href="/" className="auth-brand" aria-label={copy.brand}>
          <Image src="/hs-quality-service.png" alt="H&S Quality Service" width={42} height={42} priority />
          <span><strong>{copy.brand}</strong><small>{accountMode ? accountTitle : 'Quality Service'}</small></span>
        </Link>
        {accountMode ? (
          <div className="auth-topline-actions account-menu-actions">
            <LanguageSwitcher compact />
            <SignOutButton />
            <button
              type="button"
              className="public-home-menu-toggle"
              aria-label={menuOpen ? copy.close : copy.open}
              aria-expanded={menuOpen}
              aria-controls="public-home-menu-panel"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        ) : (
          <div className="public-home-nav">
            <LanguageSwitcher compact />
          </div>
        )}
      </header>
      {accountMode && menuOpen && (
        <div className="public-home-menu-overlay">
          <button className="public-home-menu-close" type="button" aria-label={copy.close} onClick={() => setMenuOpen(false)}>
            <X aria-hidden="true" />
          </button>
          <nav id="public-home-menu-panel" className="public-home-menu-panel" aria-label={copy.navigation}>
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>
            ))}
            <div className="public-home-menu-footer">
              <LanguageSwitcher compact />
              {accountMode
                ? <SignOutButton />
                : <Link href="/sign-in" onClick={() => setMenuOpen(false)}>{copy.account}</Link>}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

