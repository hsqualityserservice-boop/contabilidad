'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Trash2 } from 'lucide-react'
import { requestAccountDeletion, cancelMyAccountDeletionRequest } from '@/app/actions/account'

type AccountDeletionCopy = {
  title: string
  description: string
  request: string
  cancel: string
  dismiss: string
  confirm: string
  confirmAction: string
  requested: string
  requestError: string
  cancelError: string
}

export function AccountDeletionControl({ requestedAt, copy }: { requestedAt: string | null; copy: AccountDeletionCopy }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [requestCancelled, setRequestCancelled] = useState(false)
  const [feedback, setFeedback] = useState('')
  const hasRequest = requestSent || (Boolean(requestedAt) && !requestCancelled)

  function requestDeletion() {
    setFeedback('')
    startTransition(async () => {
      try {
        const result = await requestAccountDeletion()
        if (result.ok) {
          setRequestSent(true)
          setRequestCancelled(false)
          setConfirming(false)
          router.refresh()
        } else {
          setFeedback(copy.requestError)
        }
      } catch {
        setFeedback(copy.requestError)
      }
    })
  }

  function cancelRequest() {
    setFeedback('')
    startTransition(async () => {
      try {
        const result = await cancelMyAccountDeletionRequest()
        if (result.ok) {
          setRequestSent(false)
          setRequestCancelled(true)
          router.refresh()
        } else {
          setFeedback(copy.cancelError)
        }
      } catch {
        setFeedback(copy.cancelError)
      }
    })
  }

  return (
    <section className="account-deletion-control" aria-labelledby="account-deletion-title" aria-busy={pending}>
      <div className="account-danger-heading">
        <ShieldAlert aria-hidden="true" />
        <h3 id="account-deletion-title">{copy.title}</h3>
      </div>
      <p className="account-danger-description">{copy.description}</p>
      {hasRequest ? (
        <div className="account-deletion-pending">
          <p role="status">{copy.requested}</p>
          <button className="account-danger-secondary" type="button" onClick={cancelRequest} disabled={pending}>
            {copy.cancel}
          </button>
        </div>
      ) : confirming ? (
        <div className="account-deletion-confirmation" role="group" aria-describedby="account-deletion-confirm-copy">
          <p id="account-deletion-confirm-copy">{copy.confirm}</p>
          <div className="account-deletion-confirm-actions">
            <button className="account-danger-secondary" type="button" onClick={() => setConfirming(false)} disabled={pending}>
              {copy.dismiss}
            </button>
            <button className="account-danger-primary" type="button" onClick={requestDeletion} disabled={pending}>
              <Trash2 aria-hidden="true" />{pending ? '…' : copy.confirmAction}
            </button>
          </div>
        </div>
      ) : (
        <button className="account-danger-trigger" type="button" onClick={() => setConfirming(true)} disabled={pending}>
          <Trash2 aria-hidden="true" />{copy.request}
        </button>
      )}
      {feedback && <p className="account-danger-error" role="alert">{feedback}</p>}
    </section>
  )
}

