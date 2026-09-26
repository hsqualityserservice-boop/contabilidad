'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { saveCustomerProfile, type CustomerType } from '@/app/actions/customer-profile'

type Locale = 'FR' | 'ES' | 'EN'

const copy = {
  FR: { welcome: 'Bienvenue', access: 'Accédez à votre espace de gestion H&S Quality Service.', noAccount: 'Vous n’avez pas encore de compte ?', title: 'Créez votre compte', subtitle: 'Accédez à votre espace H&S Quality Service.', type: 'Type de client', particular: 'Particulier', company: 'Entreprise', firstName: 'Prénom', lastName: 'Nom', phone: 'Téléphone', address: 'Adresse complète', companyName: "Nom de l'entreprise", vat: 'Numéro IDE / TVA suisse', password: 'Mot de passe', submit: 'Créer le compte', pending: 'Création du compte…', signIn: 'Se connecter', already: 'Vous avez déjà un compte ?', error: 'Impossible de créer le compte. Vérifiez vos données.', generic: 'Impossible de contacter le serveur.', invalidSignIn: 'Impossible de vous connecter. Vérifiez vos identifiants.' },
  ES: { welcome: 'Bienvenido', access: 'Accede a tu espacio de gestión de H&S Quality Service.', noAccount: '¿Todavía no tienes una cuenta?', title: 'Crea tu cuenta', subtitle: 'Crea tu acceso al espacio de H&S Quality Service.', type: 'Tipo de cliente', particular: 'Particular', company: 'Empresa', firstName: 'Nombre', lastName: 'Apellidos', phone: 'Teléfono', address: 'Dirección completa', companyName: 'Nombre de la empresa', vat: 'Número IDE / TVA suizo', password: 'Contraseña', submit: 'Crear cuenta', pending: 'Creando cuenta…', signIn: 'Inicia sesión', already: '¿Ya tienes una cuenta?', error: 'No se pudo crear la cuenta. Comprueba tus datos.', generic: 'No se pudo conectar con el servidor.', invalidSignIn: 'No se pudo iniciar sesión. Comprueba tus datos.' },
  EN: { welcome: 'Welcome', access: 'Access your H&S Quality Service management space.', noAccount: 'Don’t have an account yet?', title: 'Create your account', subtitle: 'Create your H&S Quality Service access.', type: 'Customer type', particular: 'Individual', company: 'Company', firstName: 'First name', lastName: 'Last name', phone: 'Phone', address: 'Full address', companyName: 'Company name', vat: 'Swiss UID / VAT number', password: 'Password', submit: 'Create account', pending: 'Creating account…', signIn: 'Sign in', already: 'Already have an account?', error: 'We could not create your account. Check your details.', generic: 'Could not connect to the server.', invalidSignIn: 'We could not sign you in. Check your details.' },
} as const

export default function AuthForm({ mode = 'sign-in' }: { mode?: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>('FR')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [customerType, setCustomerType] = useState<CustomerType>('particular')
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', address: '', companyName: '', vatNumber: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const t = copy[locale]
  const isSignIn = mode === 'sign-in'

  function updateProfile(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const result = isSignIn
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: customerType === 'empresa' ? profile.companyName : `${profile.firstName} ${profile.lastName}` })
      if (result.error) { setError(isSignIn ? t.invalidSignIn : t.error); setPending(false); return }
      if (!isSignIn) await saveCustomerProfile({ customerType, ...profile })
      router.push('/dashboard')
      router.refresh()
    } catch { setError(t.generic); setPending(false) }
  }

  return <div className="flex w-full max-w-md flex-col gap-3">
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm" aria-label="Language selector">
      <span className="text-xs font-semibold text-slate-500">H&S Quality Service</span>
      <div className="flex items-center gap-1" role="group" aria-label="Choose language">
        {(['FR', 'ES', 'EN'] as Locale[]).map((item) => <button key={item} type="button" onClick={() => setLocale(item)} aria-pressed={locale === item} className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${locale === item ? 'bg-[#c1121f] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{item}</button>)}
      </div>
    </div>
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
    <div className="mb-8 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#c1121f] text-white"><ShieldCheck className="size-5" /></div><div><p className="text-lg font-bold tracking-tight text-[#12243d]">H&S Quality Service</p><p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Nettoyage professionnel</p></div></div>
    <div className="mb-7"><h1 className="text-2xl font-bold tracking-tight text-[#152238]">{isSignIn ? t.welcome : t.title}</h1><p className="mt-2 text-sm text-slate-500">{isSignIn ? t.access : t.subtitle}</p></div>
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Email<div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#c1121f]" /></div></label>
      {!isSignIn && <><fieldset className="flex flex-col gap-2"><legend className="text-sm font-semibold text-slate-700">{t.type}</legend><div className="grid grid-cols-2 gap-2">{(['particular', 'empresa'] as CustomerType[]).map((item) => <button key={item} type="button" onClick={() => setCustomerType(item)} className={`h-10 rounded-xl border text-sm font-semibold ${customerType === item ? 'border-[#c1121f] bg-rose-50 text-[#c1121f]' : 'border-slate-200 text-slate-600'}`}>{item === 'particular' ? t.particular : t.company}</button>)}</div></fieldset><div className="grid grid-cols-2 gap-3">{customerType === 'particular' ? <><input required placeholder={t.firstName} value={profile.firstName} onChange={(e) => updateProfile('firstName', e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" /><input required placeholder={t.lastName} value={profile.lastName} onChange={(e) => updateProfile('lastName', e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" /><input required placeholder={t.phone} value={profile.phone} onChange={(e) => updateProfile('phone', e.target.value)} className="col-span-2 h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" /></> : <><input required placeholder={t.companyName} value={profile.companyName} onChange={(e) => updateProfile('companyName', e.target.value)} className="col-span-2 h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" /><input required placeholder={t.vat} value={profile.vatNumber} onChange={(e) => updateProfile('vatNumber', e.target.value)} className="col-span-2 h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" /></>}</div><input required aria-label={customerType === 'empresa' ? 'Dirección fiscal' : t.address} placeholder={customerType === 'empresa' ? 'Dirección fiscal' : t.address} value={profile.address} onChange={(e) => updateProfile('address', e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm" /></>}
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">{t.password}<div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      <button disabled={pending} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c1121f] text-sm font-semibold text-white disabled:opacity-60">{pending ? t.pending : (isSignIn ? t.signIn : t.submit)}{!pending && <ArrowRight className="size-4" />}</button>
    </form>
    <p className="mt-4 text-center text-sm text-slate-500">{isSignIn ? t.noAccount : t.already} <Link href={mode === 'sign-up' ? '/sign-in' : '/sign-up'} className="font-semibold text-[#c1121f] hover:underline">{isSignIn ? t.submit : t.signIn}</Link></p>
    </div>
  </div>
}
