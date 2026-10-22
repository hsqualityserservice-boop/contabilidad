'use client'

import { useState, type FormEvent } from 'react'
import { Check, Copy, UserPlus } from 'lucide-react'
import { createStaffInvite } from '@/app/actions/account'
import { useLanguage } from '@/components/language-provider'
import { messages } from '@/lib/i18n'

export function AdminStaffInvite() {
  const { locale } = useLanguage()
  const t = messages[locale].admin
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setCode('')
    setCopied(false)
    setIsSubmitting(true)
    try {
      const result = await createStaffInvite({ email })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setCode(result.code)
      setExpiresAt(result.expiresAt)
    } catch {
      setError(t.inviteCreate)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setError(t.inviteCreate)
    }
  }

  return (
    <section className="staff-invite-panel" aria-labelledby="staff-invite-title">
      <div className="staff-invite-heading">
        <span className="staff-invite-icon"><UserPlus aria-hidden="true" /></span>
        <div><h2 id="staff-invite-title">{t.inviteTitle}</h2><p>{t.inviteCopy}</p></div>
      </div>
      <form className="staff-invite-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>{t.inviteEmail}</span>
          <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <button className="admin-approve-button" type="submit" disabled={isSubmitting}>
          <UserPlus aria-hidden="true" /> {isSubmitting ? '…' : t.inviteCreate}
        </button>
      </form>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {code && <div className="staff-invite-result" role="status">
        <p>{t.inviteCodeReady}</p>
        <div className="staff-invite-code-row"><code>{code}</code><button type="button" className="secondary-button" onClick={copyCode} aria-label={copied ? t.inviteCopied : t.copyCode}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? t.inviteCopied : t.copyCode}</button></div>
        <small>{t.inviteExpires}: {new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(expiresAt))}</small>
      </div>}
    </section>
  )
}
