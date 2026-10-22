'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useLanguage } from '@/components/language-provider'
import { messages } from '@/lib/i18n'

export function SignOutButton() {
  const router = useRouter()
  const { locale } = useLanguage()
  const t = messages[locale].account
  const [pending, setPending] = useState(false)

  async function handleSignOut() {
    setPending(true)
    await authClient.signOut()
    router.replace('/sign-in')
    router.refresh()
  }

  return <button type="button" className="auth-secondary-button" onClick={handleSignOut} disabled={pending}>{pending ? t.signingOut : t.signOut}</button>
}
