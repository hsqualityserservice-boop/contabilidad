'use client'

import { useState, useTransition } from 'react'
import { MailCheck } from 'lucide-react'
import { resendStaffVerification } from '@/app/actions/account'
import { useLanguage } from '@/components/language-provider'
import { messages } from '@/lib/i18n'

export function AdminResendVerification({ userId }: { userId: string }) {
  const { locale } = useLanguage()
  const t = messages[locale].admin
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleResend() {
    setMessage('')
    startTransition(async () => {
      try {
        const result = await resendStaffVerification(userId)
        setMessage(result.ok ? t.verificationSent : t[result.error])
      } catch {
        setMessage(t.verificationSendFailed)
      }
    })
  }

  return (
    <div className="admin-verification-action">
      <button className="admin-reject-button" type="button" onClick={handleResend} disabled={isPending}>
        <MailCheck aria-hidden="true" /> {isPending ? '…' : t.resendVerification}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  )
}
