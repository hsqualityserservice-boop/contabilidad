import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { BriefcaseBusiness, Check, Clock3, House, MapPin, ShieldCheck, UserRound, X } from 'lucide-react'
import { approveClientScheduleProposal, approveStaffApplication, assignStaffToServiceRequest, getAccountDeletionRequests, getAssignableStaff, getOperationsServiceRequests, getPendingStaffApplications, rejectStaffApplication, updateClientRequestStatus } from '@/app/actions/account'
import { AdminAccountDeletionActions } from '@/components/admin-account-deletion-actions'
import { AdminStaffInvite } from '@/components/admin-staff-invite'
import { AdminResendVerification } from '@/components/admin-resend-verification'
import { cantonOptions } from '@/lib/client-pricing'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PublicHomeHeader } from '@/components/public-home-header'
import { messages } from '@/lib/i18n'
import { getLocale } from '@/lib/locale-server'
import { schedulingCopy } from '@/lib/scheduling-copy'

export default async function AdminPage() {
  const locale = await getLocale()
  const t = messages[locale].admin
  const serviceT = messages[locale].services
  const scheduleT = schedulingCopy(locale)
  const statusLabels = { requested: t.received, reviewing: t.reviewing, confirmed: t.confirmed, completed: t.completed, cancelled: t.cancelled }
  const serviceLabels: Record<string, string> = { prive_regular: serviceT.regular, fin_de_bail: serviceT.tenancy, fin_travaux: serviceT.construction, bureaux: serviceT.offices, cabinet_medical: serviceT.medical, conciergerie: locale === 'fr' ? 'Conciergerie' : locale === 'en' ? 'Property management' : 'Conserjería', airbnb: locale === 'fr' ? 'Airbnb / location saisonnière' : locale === 'en' ? 'Airbnb / holiday rental' : 'Airbnb / alquiler vacacional' }
  const cantonLabels: Record<string, string> = locale === 'fr'
    ? { GE: 'Genève (GE)', VD: 'Vaud / Lausanne (VD)', FR: 'Fribourg (FR)', NE: 'Neuchâtel (NE)', VS: 'Valais (VS)' }
    : locale === 'en'
      ? { GE: 'Geneva (GE)', VD: 'Vaud / Lausanne (VD)', FR: 'Fribourg (FR)', NE: 'Neuchâtel (NE)', VS: 'Valais (VS)' }
      : Object.fromEntries(cantonOptions.map((option) => [option.code, option.label]))
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [profile] = await db
    .select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (profile?.role !== 'admin' || profile.status !== 'active') redirect('/account')

  const [staffApplications, serviceRequests, assignableStaff, deletionRequests] = await Promise.all([
    getPendingStaffApplications(),
    getOperationsServiceRequests(),
    getAssignableStaff(),
    getAccountDeletionRequests(),
  ])
  const applicants = staffApplications?.applicants ?? []
  const unverifiedApplicants = staffApplications?.unverifiedApplicants ?? []

  return (
    <main className="auth-shell admin-shell">
      <PublicHomeHeader locale={locale} accountMode accountTitle={t.brandSub} />
      <section className="admin-content" aria-labelledby="admin-title">
        <div className="admin-heading">
          <div><p className="auth-eyebrow">{t.eyebrow}</p><h1 id="admin-title">{t.title}</h1><p>{t.intro}</p></div>
          <div className="admin-heading-actions"><Link href="/workspace" className="auth-secondary-button">{t.workspace}</Link><span className="admin-role-badge"><ShieldCheck aria-hidden="true" /> {t.role}</span></div>
        </div>
        <AdminStaffInvite />
        <div className="admin-section-heading"><div><h2>{t.staffRequests}</h2><p>{t.staffCopy}</p></div><span className="admin-count">{applicants.length + unverifiedApplicants.length} {t.pending}</span></div>
        {!applicants.length && !unverifiedApplicants.length ? <div className="admin-empty"><Check aria-hidden="true" /><strong>{t.noStaff}</strong><span>{t.noStaffCopy}</span></div> : <div className="applicant-list">
          {unverifiedApplicants.map((applicant) => <article className="applicant-card" key={applicant.userId}>
            <div className="applicant-avatar"><Clock3 aria-hidden="true" /></div>
            <div className="applicant-details">
              <div className="applicant-title"><h3>{applicant.name}</h3><span><Clock3 aria-hidden="true" /> {t.unverifiedEmail}</span></div>
              <p>{applicant.email}</p>
              <p>{t.unverifiedEmailCopy}</p>
              <small>{t.submitted} {new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(applicant.submittedAt)}</small>
            </div>
            <div className="applicant-actions"><AdminResendVerification userId={applicant.userId} /></div>
          </article>)}
          {applicants.map((applicant) => {
            const photo = applicant.documents.find((document) => document.type === 'profile_photo')
            return <article className="applicant-card" key={applicant.userId}>
              <div className="applicant-avatar">{photo ? <img src={`/api/staff-documents/${photo.id}`} alt={`${applicant.name} — ${t.staffNationality}`} /> : <UserRound aria-hidden="true" />}</div>
              <div className="applicant-details">
                <div className="applicant-title"><h3>{applicant.name}</h3><span><Clock3 aria-hidden="true" /> {t.pending}</span></div>
                <p>{applicant.email} · {applicant.phone}</p>
                <p><MapPin aria-hidden="true" />{applicant.address}, {applicant.postalCode} {applicant.city}</p>
                <div className="staff-applicant-facts">
                  {applicant.nationality && <p><strong>{t.staffNationality}:</strong> {applicant.nationality}</p>}
                  {applicant.residencePermitType && <p><strong>{t.staffPermit}:</strong> {applicant.residencePermitType}{applicant.residencePermitExpiry ? ` · ${applicant.residencePermitExpiry}` : ''}</p>}
                  {applicant.workExperience && <p><strong>{t.staffExperience}:</strong> {applicant.workExperience}</p>}
                </div>
                {applicant.documents.length > 0 && <div className="staff-applicant-documents"><strong>{t.staffDocuments}</strong>{applicant.documents.map((document) => <a key={document.id} href={`/api/staff-documents/${document.id}`} target="_blank" rel="noreferrer">{document.type === 'profile_photo' ? messages[locale].staff.profilePhoto : document.type === 'residence_permit' ? t.staffPermit : document.type.toUpperCase()} · {document.originalName}</a>)}</div>}
                <small>{t.submitted} {new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(applicant.submittedAt)}</small>
              </div>
              <div className="applicant-actions">
                <form action={approveStaffApplication.bind(null, applicant.userId)}><button className="admin-approve-button" type="submit"><Check aria-hidden="true" /> {t.approve}</button></form>
                <form action={rejectStaffApplication.bind(null, applicant.userId)}><button className="admin-reject-button" type="submit" aria-label={`${t.rejectLabel} ${applicant.name}`}><X aria-hidden="true" /> {t.reject}</button></form>
              </div>
            </article>
          })}
        </div>}
        <div className="admin-section-heading client-admin-heading"><div><h2>{t.deletionRequests}</h2><p>{t.deletionCopy}</p></div><span className="admin-count">{deletionRequests.length} {t.pending}</span></div>
        {!deletionRequests.length ? <div className="admin-empty"><Check aria-hidden="true" /><strong>{t.noDeletionRequests}</strong></div> : <div className="applicant-list">
          {deletionRequests.map((request) => <article className="applicant-card" key={request.userId}>
            <div className="applicant-avatar"><Clock3 aria-hidden="true" /></div>
            <div className="applicant-details">
              <div className="applicant-title"><h3>{request.name}</h3><span>{request.role === 'customer' ? t.customerRole : t.staffRole}</span></div>
              <p>{request.email}</p>
              <p>{request.openWorkCount > 0 ? `${request.openWorkCount} ${t.openWorkCount}` : t.readyToDelete}</p>
              <small>{t.requestedDate} {request.submittedAt ? new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(new Date(request.submittedAt)) : ''}</small>
            </div>
            <AdminAccountDeletionActions userId={request.userId} openWorkCount={request.openWorkCount} copy={{
              blocked: t.deletionBlocked,
              delete: t.deleteAccount,
              cancelReview: t.cancelDeletionReview,
              deleteConfirm: t.deleteConfirm,
              requestError: t.deletionFailed,
              cancelError: t.cancelDeletionFailed,
            }} />
          </article>)}
        </div>}
        <div className="admin-section-heading client-admin-heading"><div><h2>{t.customerRequests}</h2><p>{t.customerCopy}</p></div><span className="admin-count">{serviceRequests?.length ?? 0} {t.requests}</span></div>
        {!serviceRequests?.length ? <div className="admin-empty"><Check aria-hidden="true" /><strong>{t.noCustomers}</strong><span>{t.noCustomersCopy}</span></div> : <div className="applicant-list">
          {serviceRequests.map((request) => <article className="client-admin-card" key={request.id}>
            <div className="applicant-avatar"><House aria-hidden="true" /></div>
            <div className="applicant-details">
              <div className="applicant-title"><h3>{request.name}</h3><span>{statusLabels[request.status as keyof typeof statusLabels]}</span></div>
              <p>{request.email} · {serviceLabels[request.serviceType] ?? request.serviceType}</p>
              <p>{request.surfaceArea} m² · {cantonLabels[request.canton] ?? request.canton} · {request.crewSize} {serviceT.professionals} · {request.estimatedHours} h</p>
              <p>{request.quoteDetails.propertyType ?? '—'} · {request.quoteDetails.bedrooms ?? 0} {locale === 'fr' ? 'chambres' : locale === 'en' ? 'bedrooms' : 'habitaciones'} · {request.quoteDetails.kitchens ?? 0} {locale === 'fr' ? 'cuisines' : locale === 'en' ? 'kitchens' : 'cocinas'} · {request.quoteDetails.livingRooms ?? 0} {locale === 'fr' ? 'séjours' : locale === 'en' ? 'living rooms' : 'salones'} · {request.quoteDetails.offices ?? 0} {locale === 'fr' ? 'bureaux' : locale === 'en' ? 'offices' : 'oficinas'} · {request.bathrooms} {locale === 'fr' ? 'salles de bain' : locale === 'en' ? 'bathrooms' : 'baños'} · {request.quoteDetails.desks ?? 0} {locale === 'fr' ? 'postes' : locale === 'en' ? 'desks' : 'escritorios'} · {request.quoteDetails.tables ?? 0} {locale === 'fr' ? 'tables' : locale === 'en' ? 'tables' : 'mesas'} · {request.quoteDetails.vitrines ?? 0} {locale === 'fr' ? 'vitrines' : locale === 'en' ? 'display windows' : 'vitrinas'} · {request.quoteDetails.windows ?? 0} {locale === 'fr' ? 'fenêtres' : locale === 'en' ? 'windows' : 'ventanas'} · {request.windowArea} m²</p>
              <p><strong>{new Intl.NumberFormat(`${locale}-CH`, { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(request.confirmedPrice ?? request.estimatedPrice)}</strong>{request.confirmedPrice ? ` · ${t.confirmedPrice}` : ''}{(request.confirmedDate ?? request.preferredDate) ? ` · ${request.confirmedDate ? t.confirmedDate : t.date}: ${new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(new Date(`${request.confirmedDate ?? request.preferredDate}T12:00:00`))}` : ''}</p>
              {request.assignedStaffName && <p>{t.assignedStaff}: <strong>{request.assignedStaffName}</strong></p>}
              {request.proposalDate && request.proposalStartTime && request.proposalEndTime && request.proposalStatus && <p className="schedule-proposal-note"><strong>{scheduleT.status}:</strong> {new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(new Date(`${request.proposalDate}T12:00:00`))} · {request.proposalStartTime.slice(0, 5)}–{request.proposalEndTime.slice(0, 5)} · {request.proposalStatus === 'proposed' ? scheduleT.proposed : request.proposalStatus === 'client_accepted' ? scheduleT.accepted : request.proposalStatus === 'approved' ? scheduleT.approved : request.proposalStatus === 'declined' ? scheduleT.declined : request.proposalStatus}</p>}
              <p className="client-admin-extras">{t.extras}: {[
                request.includeOven && serviceT.oven,
                request.includeFridge && serviceT.fridge,
                request.includeWindows && `${serviceT.windows} (${request.windowArea} m²)`,
                request.includeTerrace && `${serviceT.terrace} (${request.terraceArea} m²)`,
                request.quoteDetails.cleanWalls && `${locale === 'fr' ? 'Nettoyage des murs' : locale === 'en' ? 'Wall cleaning' : 'Limpieza de muros'} (${request.quoteDetails.wallArea} m²)`,
                request.quoteDetails.postConstructionDust && (locale === 'fr' ? 'Poussière de fin de chantier' : locale === 'en' ? 'Post-construction dust' : 'Polvo de fin de obra'),
                request.quoteDetails.paintMarks && `${locale === 'fr' ? 'Traces de peinture' : locale === 'en' ? 'Paint marks' : 'Manchas de pintura'} (${request.quoteDetails.wallArea} m²)`,
              ].filter(Boolean).join(', ') || t.noExtras}</p>
              {(request.quoteDetails.parkingAvailable || request.quoteDetails.keyHandover) && <p>{locale === 'fr' ? 'Accès :' : locale === 'en' ? 'Access:' : 'Acceso:'} {[request.quoteDetails.parkingAvailable && (locale === 'fr' ? 'Parking disponible' : locale === 'en' ? 'Parking available' : 'Parking disponible'), request.quoteDetails.keyHandover && (locale === 'fr' ? 'Remise des clés à prévoir' : locale === 'en' ? 'Key handover needed' : 'Entrega de llaves necesaria')].filter(Boolean).join(' · ')}</p>}
              {request.message && <small>{request.message}</small>}
              <small>{t.receivedOn} {new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(request.createdAt)}</small>
            </div>
            {request.status !== 'completed' && request.status !== 'cancelled' && <div className="applicant-actions">
              {request.status === 'requested' && <form action={updateClientRequestStatus.bind(null, request.id, 'reviewing')}><button className="admin-reject-button" type="submit">{t.markReview}</button></form>}
              {request.status === 'reviewing' && <>
                <form className="request-confirm-form" action={assignStaffToServiceRequest.bind(null, request.id)}>
                  <label>{scheduleT.assignment}<select name="assignedStaffUserId" required defaultValue={request.assignedStaffUserId ?? ''}>
                    <option value="" disabled>{assignableStaff.length ? t.chooseStaff : t.noStaffAvailable}</option>
                    {assignableStaff.map((staffMember) => <option key={staffMember.userId} value={staffMember.userId}>{staffMember.name}</option>)}
                  </select></label>
                  <button className="admin-reject-button" type="submit" disabled={!assignableStaff.length}>{scheduleT.assign}</button>
                </form>
                {request.assignedStaffUserId && request.proposalStatus === 'client_accepted' && <form className="schedule-admin-approval" action={approveClientScheduleProposal.bind(null, request.id)}>
                  <label>{t.confirmedPrice}<input name="confirmedPrice" type="number" min="1" max="1000000" step="1" required defaultValue={request.estimatedPrice} /></label>
                  <button className="admin-approve-button" type="submit">{scheduleT.finalApproval}</button>
                </form>}
                {!request.assignedStaffUserId && <p className="schedule-empty">{scheduleT.assignmentHint}</p>}
                {request.assignedStaffUserId && request.proposalStatus !== 'client_accepted' && request.proposalStatus !== 'approved' && <p className="schedule-empty">{scheduleT.assignmentHint}</p>}
              </>}
              {request.status === 'confirmed' && <form action={updateClientRequestStatus.bind(null, request.id, 'completed')}><button className="admin-approve-button" type="submit">{t.complete}</button></form>}
              <form action={updateClientRequestStatus.bind(null, request.id, 'cancelled')}><button className="admin-reject-button" type="submit">{t.cancel}</button></form>
            </div>}
          </article>)}
        </div>}
        <p className="admin-security-note"><BriefcaseBusiness aria-hidden="true" /> {t.security}</p>
      </section>
      <footer className="auth-footer">HS Quality Service · {t.footer}</footer>
    </main>
  )
}
