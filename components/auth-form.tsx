'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, KeyRound, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { createAccountProfile, validateStaffInvite } from '@/app/actions/account'
import { authClient } from '@/lib/auth-client'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/components/language-provider'
import { messages } from '@/lib/i18n'

type Mode = 'sign-in' | 'sign-up' | 'complete-profile' | 'reset-password'
type AccountType = 'private' | 'professional'
type AccessType = 'customer' | 'staff'

const authFormCopy = {
  es: { teamAccess: '¿Formas parte del equipo? Usa tu invitación', customerAccess: 'Crear una cuenta de cliente', privateAccount: 'Cuenta particular', companyAccount: 'Cuenta profesional', accept: 'Acepto las', terms: 'Condiciones', and: 'y la', privacy: 'Política de privacidad (LPD Suiza).' },
  fr: { teamAccess: 'Vous faites partie de l’équipe ? Utilisez votre invitation', customerAccess: 'Créer un compte client', privateAccount: 'Compte particulier', companyAccount: 'Compte professionnel', teamAccount: 'Accès du personnel', accept: 'J’accepte les', terms: 'Conditions', and: 'et la', privacy: 'Politique de confidentialité (LPD suisse).' },
  en: { teamAccess: 'Part of the team? Use your invitation', customerAccess: 'Create a customer account', privateAccount: 'Personal account', companyAccount: 'Business account', teamAccount: 'Staff access', accept: 'I accept the', terms: 'Terms', and: 'and the', privacy: 'Swiss privacy policy (FADP).' },
} as const

export function AuthForm({ mode, token, userEmail, initialRecovery = false }: { mode: Mode; token?: string; userEmail?: string; initialRecovery?: boolean }) {
  const router = useRouter()
  const { locale } = useLanguage()
  const t = messages[locale].auth
  const copy = authFormCopy[locale]
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accessType, setAccessType] = useState<AccessType>('customer')
  const [inviteCode, setInviteCode] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('private')
  const [phone, setPhone] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyIde, setCompanyIde] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(initialRecovery)
  const [recoverySent, setRecoverySent] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)

  const isSignUp = mode === 'sign-up'
  const isCompletingProfile = mode === 'complete-profile'
  const isResetPassword = mode === 'reset-password'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if ((isSignUp || isResetPassword) && password !== confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setIsSubmitting(true)
    let accountCreated = false
    try {
      if (isPasswordRecovery) {
        const result = await authClient.requestPasswordReset({
          email: email.trim(),
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (result.error) throw new Error('auth')
        setRecoverySent(true)
        return
      }

      if (isResetPassword) {
        if (!token) throw new Error('invalid-reset-token')
        const result = await authClient.resetPassword({ newPassword: password, token })
        if (result.error) throw new Error('auth')
        setPasswordReset(true)
        return
      }

      if (isCompletingProfile) {
        const profile = await createAccountProfile({
          accessType,
          inviteCode: inviteCode.trim() || undefined,
          accountType,
          phone,
          streetAddress,
          postalCode,
          city,
          companyName,
          companyIde,
        })
        if (!profile.ok) throw new Error('profile')
        router.push(profile.destination)
        router.refresh()
        return
      }

      if (isSignUp) {
        if (accessType === 'staff' && !(await validateStaffInvite({ email: email.trim(), code: inviteCode }))) {
          throw new Error('invite')
        }
        const result = await authClient.signUp.email({ name: name.trim(), email: email.trim(), password, callbackURL: '/account' })
        if (result.error) throw new Error('auth')
        accountCreated = true

        const profile = await createAccountProfile({
          accessType,
          inviteCode: inviteCode.trim() || undefined,
          accountType,
          phone,
          streetAddress,
          postalCode,
          city,
          companyName,
          companyIde,
        })

        if (!profile.ok) {
          router.replace('/account')
          router.refresh()
          return
        }

        router.push(profile.destination)
      } else {
        const result = await authClient.signIn.email({ email: email.trim(), password })
        if (result.error) throw new Error('auth')
        router.push('/account')
      }
      router.refresh()
    } catch {
      if (accountCreated) {
        router.replace('/account')
        router.refresh()
      } else {
        setError(t.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-topline">
        <Link href="/" className="auth-brand" aria-label={t.back}>
          <Image src="/hs-quality-service.png" alt="H&S Quality Service" width={42} height={42} priority />
          <span><strong>HS Cleaning</strong><small>{t.brandSub}</small></span>
        </Link>
        <div className="auth-topline-actions"><LanguageSwitcher compact /><Link href="/" className="auth-back-link"><ArrowLeft aria-hidden="true" /> {t.back}</Link></div>
      </div>

      <section className={`auth-card ${isSignUp ? 'auth-signup-card' : ''}`} aria-labelledby="auth-title">
        {!isCompletingProfile && !isResetPassword && !isPasswordRecovery && <nav className="auth-mode-tabs" aria-label={locale === 'fr' ? 'Type d’accès' : locale === 'en' ? 'Account access' : 'Tipo de acceso'}>
          <Link href="/sign-in" aria-current={!isSignUp ? 'page' : undefined} className={!isSignUp ? 'auth-mode-tab auth-mode-tab-active' : 'auth-mode-tab'}>{t.signIn}</Link>
          <Link href="/sign-up" aria-current={isSignUp ? 'page' : undefined} className={isSignUp ? 'auth-mode-tab auth-mode-tab-active' : 'auth-mode-tab'}>{t.create}</Link>
        </nav>}
        <div className="auth-mark"><LockKeyhole aria-hidden="true" /></div>
        <p className="auth-eyebrow">{t.eyebrow}</p>
        <h1 id="auth-title">{isSignUp ? t.signUpTitle : isCompletingProfile ? t.completeProfileTitle : isResetPassword || isPasswordRecovery ? t.resetTitle : t.signInTitle}</h1>
        <p className="auth-intro">{isSignUp ? t.signUpIntro : isCompletingProfile ? t.completeProfileIntro : isResetPassword || isPasswordRecovery ? t.resetIntro : t.signInIntro}</p>
        {isCompletingProfile && userEmail && <p className="auth-hint">{t.email}: <strong>{userEmail}</strong></p>}


        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && <>
            {accessType === 'customer' && <fieldset className="auth-choice-group auth-signup-account-type">
              <legend>{t.customerAccount}</legend>
              <div className="auth-choice-row">
                <label className={`auth-choice ${accountType === 'private' ? 'auth-choice-active' : ''}`}>
                  <input type="radio" name="accountType" value="private" checked={accountType === 'private'} onChange={() => setAccountType('private')} />
                  <UserRound aria-hidden="true" /><span><strong>{copy.privateAccount}</strong><small>{t.home}</small></span>
                  {accountType === 'private' && <Check className="auth-choice-check" aria-hidden="true" />}
                </label>
                <label className={`auth-choice auth-choice-professional ${accountType === 'professional' ? 'auth-choice-active' : ''}`}>
                  <input type="radio" name="accountType" value="professional" checked={accountType === 'professional'} onChange={() => setAccountType('professional')} />
                  <BriefcaseBusiness aria-hidden="true" /><span><strong>{copy.companyAccount}</strong><small>{t.company}</small></span>
                  {accountType === 'professional' && <Check className="auth-choice-check" aria-hidden="true" />}
                </label>
              </div>
            </fieldset>}

            <button className="auth-team-toggle" type="button" onClick={() => { setAccessType(accessType === 'customer' ? 'staff' : 'customer'); setError('') }}>
              {accessType === 'customer' ? copy.teamAccess : copy.customerAccess}
            </button>
            {accessType === 'staff' && <div className="auth-field staff-invite-field">
              <p className="auth-hint">{t.staffApproval}</p>
              <label htmlFor="staff-invite-code">{t.inviteCode}</label>
              <input id="staff-invite-code" autoComplete="off" maxLength={40} required value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} />
              <small>{t.inviteCodeHint}</small>
            </div>}

            <div className="auth-field-grid">
              <div className="auth-field auth-field-wide"><label htmlFor="full-name">{t.fullName}</label><input id="full-name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} /></div>
              <div className="auth-field"><label htmlFor="phone">{t.phone}</label><input id="phone" type="tel" autoComplete="tel" inputMode="tel" minLength={6} maxLength={30} required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+41 …" /></div>
              <div className="auth-field"><label htmlFor="email-address">{t.email}</label><input id="email-address" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
              <div className="auth-field auth-field-wide"><label htmlFor="street-address">{t.address}</label><input id="street-address" autoComplete="street-address" minLength={4} maxLength={180} required value={streetAddress} onChange={(event) => setStreetAddress(event.target.value)} placeholder={t.street} /></div>
              <div className="auth-field"><label htmlFor="postal-code">{t.postal}</label><input id="postal-code" autoComplete="postal-code" minLength={3} maxLength={16} required value={postalCode} onChange={(event) => setPostalCode(event.target.value)} /></div>
              <div className="auth-field"><label htmlFor="city">{t.city}</label><input id="city" autoComplete="address-level2" minLength={2} maxLength={100} required value={city} onChange={(event) => setCity(event.target.value)} /></div>
            </div>

            {accessType === 'customer' && accountType === 'professional' && <div className="auth-field-grid auth-company-fields">
              <div className="auth-field auth-field-wide"><label htmlFor="company-name">{t.companyName}</label><input id="company-name" autoComplete="organization" required value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></div>
              <div className="auth-field auth-field-wide"><label htmlFor="company-ide">{t.ide}</label><input id="company-ide" autoComplete="off" required pattern="CHE-?[0-9]{3}[.][0-9]{3}[.][0-9]{3}" value={companyIde} onChange={(event) => setCompanyIde(event.target.value)} placeholder="CHE-123.456.789" /><small>{t.ideHint}</small></div>
            </div>}

            <div className="auth-field-grid auth-password-grid">
              <div className="auth-field"><label htmlFor="password">{t.password}</label><input id="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /><small>{t.passwordHint}</small></div>
              <div className="auth-field"><label htmlFor="confirm-password">{t.confirmPassword}</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
            </div>

            <label className="auth-legal-consent">
              <input type="checkbox" required checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
              <span>{copy.accept} <Link href="/terms" target="_blank" rel="noreferrer">{copy.terms}</Link> {copy.and} <Link href="/privacy" target="_blank" rel="noreferrer">{copy.privacy}</Link></span>
            </label>
          </>}

          {isCompletingProfile && <>
            <fieldset className="auth-choice-group">
              <legend>{t.usage}</legend>
              <div className="auth-choice-row">
                <label className={`auth-choice ${accessType === 'customer' ? 'auth-choice-active' : ''}`}><input type="radio" name="accessType" value="customer" checked={accessType === 'customer'} onChange={() => setAccessType('customer')} /><UserRound aria-hidden="true" /><span><strong>{t.customer}</strong><small>{t.requestService}</small></span>{accessType === 'customer' && <Check className="auth-choice-check" aria-hidden="true" />}</label>
                <label className={`auth-choice ${accessType === 'staff' ? 'auth-choice-active' : ''}`}><input type="radio" name="accessType" value="staff" checked={accessType === 'staff'} onChange={() => setAccessType('staff')} /><BriefcaseBusiness aria-hidden="true" /><span><strong>{t.staff}</strong><small>{t.requestTeam}</small></span>{accessType === 'staff' && <Check className="auth-choice-check" aria-hidden="true" />}</label>
              </div>
              {accessType === 'staff' && <><p className="auth-hint">{t.staffApproval}</p><div className="auth-field staff-invite-field"><label htmlFor="staff-invite-code">{t.inviteCode}</label><input id="staff-invite-code" autoComplete="off" maxLength={40} required value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} /><small>{t.inviteCodeHint}</small></div></>}
            </fieldset>
            {accessType === 'customer' && <fieldset className="auth-choice-group"><legend>{t.customerAccount}</legend><div className="auth-choice-row">
              <label className={`auth-choice ${accountType === 'private' ? 'auth-choice-active' : ''}`}><input type="radio" name="accountType" value="private" checked={accountType === 'private'} onChange={() => setAccountType('private')} /><UserRound aria-hidden="true" /><span><strong>{t.private}</strong><small>{t.home}</small></span>{accountType === 'private' && <Check className="auth-choice-check" aria-hidden="true" />}</label>
              <label className={`auth-choice ${accountType === 'professional' ? 'auth-choice-active' : ''}`}><input type="radio" name="accountType" value="professional" checked={accountType === 'professional'} onChange={() => setAccountType('professional')} /><BriefcaseBusiness aria-hidden="true" /><span><strong>{t.professional}</strong><small>{t.company}</small></span>{accountType === 'professional' && <Check className="auth-choice-check" aria-hidden="true" />}</label>
            </div></fieldset>}
            <div className="auth-field-grid">
              <div className="auth-field auth-field-wide"><label htmlFor="phone">{t.phone}</label><input id="phone" type="tel" autoComplete="tel" inputMode="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+41 …" /></div>
              <div className="auth-field auth-field-wide"><label htmlFor="street-address">{t.address}</label><input id="street-address" autoComplete="street-address" required value={streetAddress} onChange={(event) => setStreetAddress(event.target.value)} placeholder={t.street} /></div>
              <div className="auth-field"><label htmlFor="postal-code">{t.postal}</label><input id="postal-code" autoComplete="postal-code" required value={postalCode} onChange={(event) => setPostalCode(event.target.value)} /></div>
              <div className="auth-field"><label htmlFor="city">{t.city}</label><input id="city" autoComplete="address-level2" required value={city} onChange={(event) => setCity(event.target.value)} /></div>
            </div>
            {accessType === 'customer' && accountType === 'professional' && <div className="auth-field-grid auth-company-fields">
              <div className="auth-field auth-field-wide"><label htmlFor="company-name">{t.companyName}</label><input id="company-name" autoComplete="organization" required value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></div>
              <div className="auth-field auth-field-wide"><label htmlFor="company-ide">{t.ide}</label><input id="company-ide" autoComplete="off" required pattern="CHE-?[0-9]{3}[.][0-9]{3}[.][0-9]{3}" value={companyIde} onChange={(event) => setCompanyIde(event.target.value)} placeholder="CHE-123.456.789" /><small>{t.ideHint}</small></div>
            </div>}
          </>}

          {!isSignUp && !isResetPassword && !isCompletingProfile && <div className="auth-field">
            <label htmlFor="email-address">{t.email}</label>
            <input id="email-address" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>}
          {!isSignUp && !isCompletingProfile && !isPasswordRecovery && (!isResetPassword || Boolean(token)) && !passwordReset && <div className="auth-field">
            <label htmlFor="password">{isResetPassword ? t.newPassword : t.password}</label>
            <input id="password" type="password" autoComplete={isResetPassword ? 'new-password' : 'current-password'} minLength={isResetPassword ? 12 : 8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
            {!isResetPassword && <button className="auth-forgot-link" type="button" onClick={() => { setError(''); setIsPasswordRecovery(true) }}><KeyRound aria-hidden="true" />{t.forgotPassword}</button>}
          </div>}
          {isResetPassword && Boolean(token) && !passwordReset && <div className="auth-field">
            <label htmlFor="confirm-password">{t.confirmPassword}</label>
            <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </div>}

          {isPasswordRecovery && recoverySent && <p className="auth-success" role="status">{t.resetSent}</p>}
          {isResetPassword && !token && <p className="auth-error" role="alert">{t.invalidResetLink}</p>}
          {isResetPassword && passwordReset && <p className="auth-success" role="status">{t.passwordUpdated}</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {isSignUp ? <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t.submitWait : t.create}{!isSubmitting && <ArrowRight aria-hidden="true" />}
          </button> : (!isResetPassword || Boolean(token) && !passwordReset) && <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t.submitWait : isPasswordRecovery ? t.sendReset : isResetPassword ? t.resetSubmit : isCompletingProfile ? t.completeProfileSubmit : t.signIn}
            {!isSubmitting && <ArrowRight aria-hidden="true" />}
          </button>}
          {!passwordReset && <p className="auth-security-note"><ShieldCheck aria-hidden="true" /> {t.security}</p>}
        </form>

        {isResetPassword ? <p className="auth-switch"><Link href="/sign-in">{t.backToSignIn}</Link></p> : isPasswordRecovery ? <p className="auth-switch"><button type="button" onClick={() => { setError(''); setIsPasswordRecovery(false); setRecoverySent(false) }}>{t.backToSignIn}</button></p> : isCompletingProfile ? <p className="auth-switch"><Link href="/">{t.back}</Link></p> : <p className="auth-switch">{isSignUp ? t.hasAccount : t.noAccount}{' '}
          <Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? t.signInLink : t.signUpLink}</Link>
        </p>}
      </section>
      <footer className="auth-footer">HS Quality Service <span>·</span> {t.footer}</footer>
    </main>
  )
}
