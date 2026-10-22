import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { BriefcaseBusiness, Clock3, ShieldCheck } from 'lucide-react'
import { StaffDossierForm } from '@/components/staff-dossier-form'
import { AccountDeletionControl } from '@/components/account-deletion-control'
import { completeAssignedServiceRequest, getAssignedStaffServiceRequests, getStaffSchedulingData } from '@/app/actions/account'
import { StaffSchedulePanel } from '@/components/staff-schedule-panel'
import { staffDocuments } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PublicHomeHeader } from '@/components/public-home-header'
import { messages } from '@/lib/i18n'
import { getLocale } from '@/lib/locale-server'

export default async function StaffPage() {
  const locale = await getLocale()
  const t = messages[locale].staff
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [profile] = await db
    .select({
      role: userProfiles.role,
      status: userProfiles.status,
      nationality: userProfiles.nationality,
      residencePermitType: userProfiles.residencePermitType,
      residencePermitExpiry: userProfiles.residencePermitExpiry,
      workExperience: userProfiles.workExperience,
      deletionRequestedAt: userProfiles.deletionRequestedAt,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (!profile) redirect('/sign-up')
  if (profile.role === 'admin') redirect('/admin')
  if (profile.role !== 'staff') redirect('/account')
  if (profile.status !== 'pending' && profile.status !== 'active' && profile.status !== 'suspended') redirect('/account')

  const documents = session.user.emailVerified
    ? await db.select({
        id: staffDocuments.id,
        type: staffDocuments.type,
        originalName: staffDocuments.originalName,
        createdAt: staffDocuments.createdAt,
      }).from(staffDocuments).where(eq(staffDocuments.userId, session.user.id)).orderBy(desc(staffDocuments.createdAt))
    : []
  const dossierDocuments = documents.map((document) => ({ ...document, createdAt: document.createdAt.toISOString() }))

  const pending = profile.status === 'pending'
  const suspended = profile.status === 'suspended'
  const [assignments, scheduling] = !pending && !suspended && session.user.emailVerified && !profile.deletionRequestedAt
    ? await Promise.all([getAssignedStaffServiceRequests(), getStaffSchedulingData()])
    : [[], { availability: [], requests: [] }]
  const serviceLabels: Record<string, string> = {
    prive_regular: messages[locale].services.regular,
    fin_de_bail: messages[locale].services.tenancy,
    fin_travaux: messages[locale].services.construction,
    bureaux: messages[locale].services.offices,
    cabinet_medical: messages[locale].services.medical,
    conciergerie: locale === 'fr' ? 'Conciergerie' : locale === 'en' ? 'Property management' : 'Conserjería',
    airbnb: locale === 'fr' ? 'Airbnb / location saisonnière' : locale === 'en' ? 'Airbnb / holiday rental' : 'Airbnb / alquiler vacacional',
  }

  return (
    <main className="auth-shell">
      <PublicHomeHeader locale={locale} accountMode accountTitle={t.title} />
      <section className="account-panel" aria-labelledby="staff-title">
        <div className="auth-mark"><BriefcaseBusiness aria-hidden="true" /></div>
        <p className="auth-eyebrow">{t.eyebrow}</p>
        <h1 id="staff-title">{pending ? t.received : suspended ? t.unavailable : `${messages[locale].account.hello}, ${session.user.name}`}</h1>
        {pending ? <>
          <p className="auth-intro">{t.pendingIntro}</p>
          <div className="staff-status"><Clock3 aria-hidden="true" /><span><strong>{t.review}</strong><small>{t.pendingNote}</small></span></div>
        </> : suspended ? <p className="auth-intro">{t.suspendedIntro}</p> : <>
          <p className="auth-intro">{t.activeIntro}</p>
          <div className="staff-status"><ShieldCheck aria-hidden="true" /><span><strong>{t.approved}</strong><small>{t.approvedNote}</small></span></div>
        </>}
        {!pending && !suspended && session.user.emailVerified && <section className="staff-jobs" aria-labelledby="staff-jobs-title">
          <div className="staff-jobs-heading"><h2 id="staff-jobs-title">{t.assignedJobs}</h2><span>{assignments.length}</span></div>
          {assignments.length === 0 ? <p className="staff-jobs-empty">{t.noAssignedJobs}</p> : <div className="staff-job-list">{assignments.map((assignment) => <article className="staff-job-card" key={assignment.id}>
            <div><div className="staff-job-title"><h3>{serviceLabels[assignment.serviceType] ?? assignment.serviceType}</h3><span>{assignment.status === 'completed' ? messages[locale].admin.completed : messages[locale].admin.confirmed}</span></div>
              <p>{assignment.clientName} · {assignment.surfaceArea} m² · {assignment.canton}</p>
              <p>{assignment.quoteDetails.propertyType ?? '—'} · {assignment.quoteDetails.bedrooms ?? 0} {locale === 'fr' ? 'chambres' : locale === 'en' ? 'bedrooms' : 'habitaciones'} · {assignment.quoteDetails.kitchens ?? 0} {locale === 'fr' ? 'cuisines' : locale === 'en' ? 'kitchens' : 'cocinas'} · {assignment.bathrooms} {locale === 'fr' ? 'salles de bain' : locale === 'en' ? 'bathrooms' : 'baños'} · {assignment.quoteDetails.tables ?? 0} {locale === 'fr' ? 'tables' : locale === 'en' ? 'tables' : 'mesas'} · {assignment.quoteDetails.desks ?? 0} {locale === 'fr' ? 'postes' : locale === 'en' ? 'desks' : 'escritorios'} · {assignment.quoteDetails.vitrines ?? 0} {locale === 'fr' ? 'vitrines' : locale === 'en' ? 'display windows' : 'vitrinas'} · {assignment.windowArea} m² {locale === 'fr' ? 'vitres' : locale === 'en' ? 'windows' : 'ventanas'}</p>
              <small>{[
                assignment.includeOven && (locale === 'fr' ? 'Four' : locale === 'en' ? 'Oven' : 'Horno'),
                assignment.includeFridge && (locale === 'fr' ? 'Réfrigérateur' : locale === 'en' ? 'Fridge' : 'Nevera'),
                assignment.quoteDetails.cleanWalls && (locale === 'fr' ? `Nettoyage des murs (${assignment.quoteDetails.wallArea} m²)` : locale === 'en' ? `Wall cleaning (${assignment.quoteDetails.wallArea} m²)` : `Limpieza de muros (${assignment.quoteDetails.wallArea} m²)`),
                assignment.quoteDetails.postConstructionDust && (locale === 'fr' ? 'Fin de chantier / poussière' : locale === 'en' ? 'Post-construction dust' : 'Fin de obra / polvo'),
                assignment.quoteDetails.paintMarks && (locale === 'fr' ? 'Traces de peinture' : locale === 'en' ? 'Paint marks' : 'Manchas de pintura'),
                assignment.includeTerrace && `${locale === 'fr' ? 'Terrasse' : locale === 'en' ? 'Terrace' : 'Terraza'} · ${assignment.terraceArea} m²`,
              ].filter(Boolean).join(' · ')}</small>
              {(assignment.streetAddress || assignment.clientPhone) && <p>{[assignment.streetAddress, assignment.postalCode, assignment.city].filter(Boolean).join(', ')}{assignment.clientPhone ? ` · ${assignment.clientPhone}` : ''}</p>}
              {assignment.confirmedDate && <p>{messages[locale].admin.confirmedDate}: {new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(new Date(`${assignment.confirmedDate}T12:00:00`))}</p>}
              {(assignment.quoteDetails.parkingAvailable || assignment.quoteDetails.keyHandover) && <small>{[assignment.quoteDetails.parkingAvailable && (locale === 'fr' ? 'Parking disponible' : locale === 'en' ? 'Parking available' : 'Parking disponible'), assignment.quoteDetails.keyHandover && (locale === 'fr' ? 'Remise des clés à prévoir' : locale === 'en' ? 'Key handover needed' : 'Entrega de llaves necesaria')].filter(Boolean).join(' · ')}</small>}
              {assignment.message && <small>{assignment.message}</small>}
            </div>
            {assignment.status === 'confirmed' && <form action={completeAssignedServiceRequest.bind(null, assignment.id)}><button className="admin-approve-button" type="submit">{t.markJobComplete}</button></form>}
          </article>)}</div>}
        </section>}
        {!pending && !suspended && session.user.emailVerified && !profile.deletionRequestedAt && <StaffSchedulePanel locale={locale} availability={scheduling.availability} requests={scheduling.requests} />}
        {!session.user.emailVerified ? <p className="auth-hint" role="status">{messages[locale].account.confirmEmail}</p> : !suspended && !profile.deletionRequestedAt && <StaffDossierForm profile={{
          nationality: profile.nationality,
          residencePermitType: profile.residencePermitType,
          residencePermitExpiry: profile.residencePermitExpiry,
          workExperience: profile.workExperience,
        }} documents={dossierDocuments} />}
<AccountDeletionControl requestedAt={profile.deletionRequestedAt?.toISOString() ?? null} copy={{
  title: messages[locale].account.deletionTitle,
  description: messages[locale].account.deletionDescription,
  request: messages[locale].account.deletionRequest,
  cancel: messages[locale].account.deletionCancel,
  dismiss: messages[locale].account.deletionDismiss,
  confirm: messages[locale].account.deletionConfirm,
  confirmAction: messages[locale].account.deletionConfirmAction,
  requested: messages[locale].account.deletionRequested,
          requestError: messages[locale].account.deletionRequestError,
          cancelError: messages[locale].account.deletionCancelError,
        }} />
        <Link href="/" className="auth-secondary-button">{t.home}</Link>
      </section>
      <footer className="auth-footer">HS Quality Service · {t.footer}</footer>
    </main>
  )
}
