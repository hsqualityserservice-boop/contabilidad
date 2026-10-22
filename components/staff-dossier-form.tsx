'use client'

import { useRouter } from 'next/navigation'
import { put } from '@vercel/blob/client'
import { useState, type FormEvent } from 'react'
import { FileText, ShieldCheck, Upload } from 'lucide-react'
import { saveStaffDossier } from '@/app/actions/account'
import { useLanguage } from '@/components/language-provider'
import { messages } from '@/lib/i18n'

type StaffDocument = {
  id: string
  type: 'profile_photo' | 'residence_permit' | 'cfc' | 'afp' | 'other'
  originalName: string
  createdAt: string
}

type StaffProfile = {
  nationality: string | null
  residencePermitType: string | null
  residencePermitExpiry: string | null
  workExperience: string | null
}

export function StaffDossierForm({ profile, documents }: { profile: StaffProfile; documents: StaffDocument[] }) {
  const router = useRouter()
  const { locale } = useLanguage()
  const t = messages[locale].staff
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const photoDocument = documents.find((document) => document.type === 'profile_photo')
  const permitDocument = documents.find((document) => document.type === 'residence_permit')
  const certificateDocuments = documents.filter((document) => ['cfc', 'afp', 'other'].includes(document.type))

  async function uploadFile(file: File, type: StaffDocument['type']) {
    const tokenResponse = await fetch('/api/staff-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'token', type, originalName: file.name, contentType: file.type, size: file.size }),
    })
    if (!tokenResponse.ok) throw new Error('upload')
    const { id, pathname, token } = await tokenResponse.json() as { id: string; pathname: string; token: string }

    try {
      const uploaded = await put(pathname, file, { access: 'private', token, contentType: file.type })
      if (uploaded.pathname !== pathname) throw new Error('upload')
      const response = await fetch('/api/staff-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'finalize', id, type, originalName: file.name, contentType: file.type, size: file.size }),
      })
      if (!response.ok) throw new Error('upload')
      return (await response.json()) as { id: string }
    } catch {
      await fetch('/api/staff-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discard', id, type, contentType: file.type }),
      }).catch(() => undefined)
      await fetch(`/api/staff-documents/${id}`, { method: 'DELETE' }).catch(() => undefined)
      throw new Error('upload')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaved(false)
    setIsSubmitting(true)
    const form = event.currentTarget
    const formData = new FormData(form)
    const uploadedDocumentIds: string[] = []
    let saveStarted = false

    const uploadAndTrack = async (file: File, type: StaffDocument['type']) => {
      const document = await uploadFile(file, type)
      uploadedDocumentIds.push(document.id)
      return document
    }
    const discardNewUploads = async () => {
      await Promise.allSettled(uploadedDocumentIds.map((id) =>
        fetch(`/api/staff-documents/${id}`, { method: 'DELETE' }),
      ))
      uploadedDocumentIds.length = 0
    }

    try {
      const photoFile = (formData.get('profilePhoto') as File | null) ?? null
      const permitFile = (formData.get('residenceDocument') as File | null) ?? null
      const photo = photoFile?.size ? await uploadAndTrack(photoFile, 'profile_photo') : photoDocument
      const permit = permitFile?.size ? await uploadAndTrack(permitFile, 'residence_permit') : permitDocument
      if (!photo || !permit) throw new Error('upload')

      formData.set('photoDocumentId', photo.id)
      formData.set('permitDocumentId', permit.id)

      for (const [field, type] of [['cfcDocument', 'cfc'], ['afpDocument', 'afp'], ['otherDocument', 'other']] as const) {
        const file = formData.get(field) as File | null
        if (file?.size) await uploadAndTrack(file, type)
      }

      saveStarted = true
      const result = await saveStaffDossier(formData)
      if (!result.ok) {
        await discardNewUploads()
        throw new Error('save')
      }
      uploadedDocumentIds.length = 0
      setSaved(true)
      form.reset()
      router.refresh()
    } catch (caughtError) {
      if (!saveStarted && uploadedDocumentIds.length > 0) await discardNewUploads()
      setError(caughtError instanceof Error && caughtError.message === 'upload' ? t.uploadError : t.dossierError)
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  const documentLabel = (type: StaffDocument['type']) => type === 'cfc' ? t.cfc : type === 'afp' ? t.afp : type === 'other' ? t.otherCertificate : type === 'profile_photo' ? t.profilePhoto : t.residenceDocument

  return (
    <section className="staff-dossier" aria-labelledby="staff-dossier-title">
      <div className="staff-dossier-heading"><span className="staff-dossier-mark"><ShieldCheck aria-hidden="true" /></span><div><p className="auth-eyebrow">{t.eyebrow}</p><h2 id="staff-dossier-title">{t.dossierTitle}</h2><p>{t.dossierIntro}</p></div></div>
      <form className="staff-dossier-form" onSubmit={handleSubmit}>
        <div className="staff-dossier-grid">
          <label className="auth-field"><span>{t.nationality}</span><input name="nationality" required minLength={2} maxLength={80} defaultValue={profile.nationality ?? ''} /></label>
          <label className="auth-field"><span>{t.permitType}</span><select name="residencePermitType" required defaultValue={profile.residencePermitType ?? ''}><option value="" disabled>—</option>{['B', 'C', 'L', 'G', 'F', 'N', 'Ci', 'other'].map((value) => <option key={value} value={value}>{value === 'other' ? 'Autre / Other' : `Permiso ${value}`}</option>)}</select></label>
          <label className="auth-field"><span>{t.permitExpiry}</span><input name="residencePermitExpiry" type="date" required defaultValue={profile.residencePermitExpiry ?? ''} /></label>
          <label className="auth-field staff-dossier-wide"><span>{t.workExperience}</span><textarea name="workExperience" required minLength={10} maxLength={4000} rows={5} defaultValue={profile.workExperience ?? ''} placeholder={t.workExperienceHint} /></label>
        </div>
        <div className="staff-upload-grid">
          <label className="staff-upload-field"><span><Upload aria-hidden="true" />{t.profilePhoto}</span><input name="profilePhoto" type="file" accept="image/jpeg,image/png,image/webp" required={!photoDocument} /><small>JPG, PNG o WebP · 10 MB</small></label>
          <label className="staff-upload-field"><span><Upload aria-hidden="true" />{t.residenceDocument}</span><input name="residenceDocument" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required={!permitDocument} /><small>PDF, JPG, PNG o WebP · 10 MB</small></label>
        </div>
        <fieldset className="staff-certificates">
          <legend>{t.attestations}</legend>
          <div className="staff-upload-grid staff-certificates-grid">
            <label className="staff-upload-field"><span><FileText aria-hidden="true" />{t.cfc}</span><input name="cfcDocument" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" /><small>PDF o imagen · 10 MB</small></label>
            <label className="staff-upload-field"><span><FileText aria-hidden="true" />{t.afp}</span><input name="afpDocument" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" /><small>PDF o imagen · 10 MB</small></label>
            <label className="staff-upload-field"><span><FileText aria-hidden="true" />{t.otherCertificate}</span><input name="otherDocument" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" /><small>PDF o imagen · 10 MB</small></label>
          </div>
        </fieldset>
        {documents.length > 0 && <div className="staff-current-documents"><h3>{t.currentDocuments}</h3><ul>{documents.map((document) => <li key={document.id}><FileText aria-hidden="true" /><a href={`/api/staff-documents/${document.id}`} target="_blank" rel="noreferrer">{documentLabel(document.type)} · {document.originalName}</a></li>)}</ul></div>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        {saved && <p className="staff-dossier-success" role="status">{t.dossierSaved}</p>}
        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? t.savingDossier : t.saveDossier}</button>
      </form>
    </section>
  )
}
