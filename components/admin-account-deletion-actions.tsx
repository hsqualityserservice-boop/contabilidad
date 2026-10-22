'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelAccountDeletionForReview, finalizeAccountDeletion } from '@/app/actions/account'

type Copy = {
  blocked: string
  delete: string
  cancelReview: string
  deleteConfirm: string
  requestError: string
  cancelError: string
}

export function AdminAccountDeletionActions({
  userId,
  openWorkCount,
  copy,
}: {
  userId: string
  openWorkCount: number
  copy: Copy
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState('')

  function deleteAccount() {
    if (openWorkCount > 0 || !window.confirm(copy.deleteConfirm)) return
    startTransition(async () => {
      const result = await finalizeAccountDeletion(userId)
      if (result.ok) {
        router.refresh()
        return
      }
      setFeedback(result.reason === 'pending-work' ? copy.blocked : copy.requestError)
    })
  }

  function cancelReview() {
    startTransition(async () => {
      const result = await cancelAccountDeletionForReview(userId)
      setFeedback(result.ok ? '' : copy.cancelError)
    })
  }

  return (
    <div className="applicant-actions account-deletion-actions">
      <button className="admin-reject-button" type="button" onClick={cancelReview} disabled={pending}>
        {copy.cancelReview}
      </button>
      <button className="admin-reject-button" type="button" onClick={deleteAccount} disabled={pending || openWorkCount > 0}>
        {pending ? '…' : copy.delete}
      </button>
      {openWorkCount > 0 && <p role="status">{copy.blocked}</p>}
      {feedback && <p role="alert">{feedback}</p>}
    </div>
  )
}
