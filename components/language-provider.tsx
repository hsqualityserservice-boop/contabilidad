'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void }
const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setCurrentLocale] = useState(initialLocale)
  const router = useRouter()
  const setLocale = useCallback((nextLocale: Locale) => {
    setCurrentLocale(nextLocale)
    document.cookie = `hs-locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    document.documentElement.lang = nextLocale
    router.refresh()
  }, [router])
  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
