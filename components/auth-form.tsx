'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { saveCustomerProfile } from '@/app/actions/customer-profile'
import { type Lang, languages } from '@/lib/i18n'

const labels = {
  FR: { title: 'Créer votre compte', sub: 'Accédez à votre espace client.', type: 'Type de client', particular: 'Particulier', company: 'Entreprise', first: 'Nom', last: 'Prénom', phone: 'Téléphone', address: 'Adresse complète', companyName: "Nom de l'entreprise", taxAddress: 'Adresse fiscale', vat: 'Numéro IDE/TVA suisse', email: 'Email', password: 'Mot de passe', submit: 'Créer le compte', pending: 'Création en cours…', login: 'Se connecter', account: 'Vous avez déjà un compte ?', error: 'Vérifiez les champs obligatoires et réessayez.' },
  ES: { title: 'Crea tu cuenta', sub: 'Accede a tu espacio cliente.', type: 'Tipo de cliente', particular: 'Particular', company: 'Empresa', first: 'Nombre', last: 'Apellidos', phone: 'Teléfono', address: 'Dirección completa', companyName: 'Nombre de la empresa', taxAddress: 'Dirección fiscal', vat: 'Número de Registro IDE/TVA Suizo', email: 'Email', password: 'Contraseña', submit: 'Crear cuenta', pending: 'Creando cuenta…', login: 'Inicia sesión', account: '¿Ya tienes una cuenta?', error: 'Comprueba los campos obligatorios e inténtalo de nuevo.' },
  EN: { title: 'Create your account', sub: 'Access your client space.', type: 'Customer type', particular: 'Individual', company: 'Company', first: 'First name', last: 'Last name', phone: 'Phone', address: 'Full address', companyName: 'Company name', taxAddress: 'Tax address', vat: 'Swiss UID/VAT number', email: 'Email', password: 'Password', submit: 'Create account', pending: 'Creating account…', login: 'Sign in', account: 'Already have an account?', error: 'Check the required fields and try again.' },
} as const

export default function AuthForm({ mode = 'sign-in' }: { mode?: 'sign-in' | 'sign-up' }) {
  const router = useRouter(); const [lang, setLang] = useState<Lang>('ES'); const t = labels[lang]
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [showPassword, setShowPassword] = useState(false); const [pending, setPending] = useState(false); const [error, setError] = useState('')
  const [customerType, setCustomerType] = useState<'particular' | 'company'>('particular')
  const [fields, setFields] = useState({ firstName: '', lastName: '', phone: '', address: '', companyName: '', taxAddress: '', vatNumber: '' })
  const update = (key: keyof typeof fields) => (event: React.ChangeEvent<HTMLInputElement>) => setFields((current) => ({ ...current, [key]: event.target.value }))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setPending(true)
    try {
      const result = mode === 'sign-up' ? await authClient.signUp.email({ email, password, name: customerType === 'company' ? fields.companyName : `${fields.firstName} ${fields.lastName}` }) : await authClient.signIn.email({ email, password })
      if (result.error) throw new Error('auth')
      if (mode === 'sign-up') await saveCustomerProfile({ customerType, ...fields })
      router.push('/dashboard'); router.refresh()
    } catch { setError(t.error); setPending(false) }
  }
  const input = (label: string, key: keyof typeof fields, type = 'text') => <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">{label}<input required type={type} value={fields[key]} onChange={update(key)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#c1121f]" /></label>
  const isSignIn = mode === 'sign-in'
  return <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10"><div className="absolute right-6 top-5 flex gap-1">{languages.map((item) => <button type="button" key={item} onClick={() => setLang(item)} aria-pressed={lang === item} className={`rounded-md px-2 py-1 text-xs font-bold ${lang === item ? 'bg-[#c1121f] text-white' : 'text-slate-500'}`}>{item}</button>)}</div><div className="mb-8 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#c1121f] text-white"><ShieldCheck className="size-5" /></div><p className="text-lg font-bold text-[#12243d]">H&S Quality Service</p></div><div className="mb-7"><h1 className="text-2xl font-bold text-[#152238]">{isSignIn ? (lang === 'FR' ? 'Bienvenue' : lang === 'EN' ? 'Welcome' : 'Bienvenido') : t.title}</h1><p className="mt-2 text-sm text-slate-500">{t.sub}</p></div><form onSubmit={handleSubmit} className="flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">{t.email}<div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm" /></div></label><label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">{t.password}<div className="relative"><LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password"><span className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</span></button></div></label>{!isSignIn && <><label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">{t.type}<select value={customerType} onChange={(e) => setCustomerType(e.target.value as 'particular' | 'company')} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3"><option value="particular">{t.particular}</option><option value="company">{t.company}</option></select></label>{customerType === 'particular' ? <>{input(t.first, 'firstName')}{input(t.last, 'lastName')}{input(t.phone, 'phone', 'tel')}{input(t.address, 'address')}</> : <>{input(t.companyName, 'companyName')}{input(t.taxAddress, 'taxAddress')}{input(t.vat, 'vatNumber')}</>}</>}{error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}<button disabled={pending} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c1121f] text-sm font-semibold text-white disabled:opacity-60">{pending ? t.pending : (isSignIn ? t.login : t.submit)}{!pending && <ArrowRight className="size-4" />}</button></form><p className="mt-6 text-center text-sm text-slate-500">{t.account} <Link href={isSignIn ? '/sign-up' : '/sign-in'} className="font-semibold text-[#c1121f]">{isSignIn ? t.title : t.login}</Link></p></div>
}
