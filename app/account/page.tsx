import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { BriefcaseBusiness, MapPin, Phone, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { AccountDeletionControl } from '@/components/account-deletion-control'
import { AuthForm } from '@/components/auth-form'
import { ClientServicePortal } from '@/components/client-service-portal'
import { getClientServiceRequests } from '@/app/actions/account'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { isInitialAdminEmail } from '@/lib/admin-bootstrap'
import { PublicHomeHeader } from '@/components/public-home-header'
import { messages } from '@/lib/i18n'
import { getLocale } from '@/lib/locale-server'
import { eq } from 'drizzle-orm'

export default async function AccountPage() {
  const locale = await getLocale()
  const t = messages[locale].account
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (!profile) return <AuthForm mode="complete-profile" userEmail={session.user.email} />

  if (isInitialAdminEmail(session.user.email) && session.user.emailVerified) {
    await db
      .update(userProfiles)
      .set({ role: 'admin', status: 'active', updatedAt: new Date() })
      .where(eq(userProfiles.userId, session.user.id))
    redirect('/admin')
  }

  if (profile.role === 'admin') redirect('/admin')
  if (profile.role === 'staff') redirect('/staff')

  const serviceRequests = await getClientServiceRequests()

  const navigationCopy = locale === 'fr'
    ? { label: 'Navigation du compte', quote: 'Nouvelle estimation', activity: 'Mes demandes', trust: 'Nos engagements' }
    : locale === 'en'
      ? { label: 'Account navigation', quote: 'New estimate', activity: 'My requests', trust: 'Our commitments' }
      : { label: 'Navegación de la cuenta', quote: 'Nueva cotización', activity: 'Mis solicitudes', trust: 'Nuestros compromisos' }
  const deletionCopy = {
    title: t.deletionTitle,
    description: t.deletionDescription,
    request: t.deletionRequest,
    cancel: t.deletionCancel,
    dismiss: t.deletionDismiss,
    confirm: t.deletionConfirm,
    confirmAction: t.deletionConfirmAction,
    requested: t.deletionRequested,
    requestError: t.deletionRequestError,
    cancelError: t.deletionCancelError,
  }

  return (
    <main className="auth-shell account-dashboard-shell">
      <PublicHomeHeader locale={locale} accountMode accountTitle={t.title} />
      <section className="account-panel account-dashboard" aria-label={t.title}>
        <div className="account-dashboard-layout">
          <aside className="account-dashboard-sidebar" aria-label={navigationCopy.label}>
            <div className="account-panel-heading">
              <div className="auth-mark"><UserRound aria-hidden="true" /></div>
              <span className="account-status"><ShieldCheck aria-hidden="true" />{session.user.emailVerified ? ` ${t.active}` : ` ${t.verification}`}</span>
            </div>
            <p className="auth-eyebrow">{t.eyebrow}</p>
            <h2 className="account-sidebar-name">{session.user.name}</h2>
            <div className="account-details">
              <div><span>{t.email}</span><strong>{session.user.email}</strong></div>
              <div><span>{t.accountType}</span><strong>{profile.accountType === 'professional' ? t.professional : t.private}</strong></div>
              {profile.companyName && <div><span>{t.company}</span><strong>{profile.companyName} · {profile.companyIde}</strong></div>}
              <div><span>{t.phone}</span><strong><Phone aria-hidden="true" />{profile.phone}</strong></div>
              <div><span>{t.address}</span><strong><MapPin aria-hidden="true" />{profile.streetAddress}, {profile.postalCode} {profile.city}, {profile.country}</strong></div>
            </div>
            <nav className="account-dashboard-nav" aria-label={navigationCopy.label}>
              {!profile.deletionRequestedAt && (
                <>
                  <a href="#client-new-quote"><Sparkles aria-hidden="true" />{navigationCopy.quote}</a>
                  <a href="#client-activity"><BriefcaseBusiness aria-hidden="true" />{navigationCopy.activity}</a>
                </>
              )}
              <a href="#client-trust"><ShieldCheck aria-hidden="true" />{navigationCopy.trust}</a>
            </nav>
            {!session.user.emailVerified && (
              <div className="account-dashboard-sidebar-bottom">
                <AccountDeletionControl requestedAt={profile.deletionRequestedAt?.toISOString() ?? null} copy={deletionCopy} />
                <p className="account-privacy"><ShieldCheck aria-hidden="true" /> {t.privacy}</p>
              </div>
            )}
          </aside>
          <div className="account-dashboard-main">
            <header className="account-dashboard-welcome">
              <div>
                <p className="auth-eyebrow">{t.eyebrow}</p>
                <h1 id="account-title">{t.hello}, {session.user.name}</h1>
                <p className="auth-intro">{t.intro}</p>
              </div>
              <span className="account-dashboard-welcome-mark"><Sparkles aria-hidden="true" /></span>
            </header>
            {!session.user.emailVerified && <p className="auth-hint" role="status">{t.confirmEmail}</p>}
            {session.user.emailVerified ? (
              <ClientServicePortal
                key={profile.deletionRequestedAt ? 'deletion-pending' : 'active'}
                customer={{ name: session.user.name, email: session.user.email, phone: profile.phone, address: `${profile.streetAddress}, ${profile.postalCode} ${profile.city}`, postalCode: profile.postalCode, companyName: profile.companyName }}
                isDeletionPending={Boolean(profile.deletionRequestedAt)}
                securityContent={
                  <div className="client-account-security">
                    <AccountDeletionControl requestedAt={profile.deletionRequestedAt?.toISOString() ?? null} copy={deletionCopy} />
                    <p className="account-privacy"><ShieldCheck aria-hidden="true" /> {t.privacy}</p>
                  </div>
                }
                requests={serviceRequests.map((request) => ({
                  ...request,
                  proposal: request.proposalDate && request.proposalStartTime && request.proposalEndTime && request.proposalStatus
                    ? { appointmentDate: request.proposalDate, startTime: request.proposalStartTime, endTime: request.proposalEndTime, status: request.proposalStatus }
                    : null,
                  createdAt: request.createdAt.toISOString(),
                }))}
              />
            ) : null}
            <div className="account-dashboard-footer">
              <Link href="/" className="auth-submit account-primary-link">{t.returnHome}</Link>
            </div>
          </div>
        </div>
      </section>
      <footer className="auth-footer"><BriefcaseBusiness aria-hidden="true" /> HS Quality Service · {locale === 'fr' ? 'Suisse' : locale === 'en' ? 'Switzerland' : 'Suiza'}</footer>
    </main>
  )
}
