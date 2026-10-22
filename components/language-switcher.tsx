'use client'

import { localeOptions } from '@/lib/i18n'
import { useLanguage } from '@/components/language-provider'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLanguage()
  const currentLocale = localeOptions.find((option) => option.value === locale) ?? localeOptions[0]
  return (
    <label className={`language-switcher${compact ? ' language-switcher-compact' : ''}`}>
      <span className={`language-switcher-flag language-flag-${locale}`} aria-hidden="true" />
      <span className="sr-only">Language / Langue / Idioma</span>
      <select value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)} aria-label="Language / Langue / Idioma">
        {localeOptions.map((option) => <option key={option.value} value={option.value}>{compact ? option.short : option.label}</option>)}
      </select>
    </label>
  )
}
