'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export default function AuthForm({ mode = 'sign-in' }: { mode?: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const result = mode === 'sign-up'
        ? await authClient.signUp.email({ email, password, name: email.split('@')[0] })
        : await authClient.signIn.email({ email, password })
      if (result.error) {
        setError(mode === 'sign-up' ? 'No se pudo crear la cuenta. Comprueba tus datos e inténtalo de nuevo.' : 'No se pudo iniciar sesión. Comprueba tus datos e inténtalo de nuevo.')
        setPending(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
      setPending(false)
    }
  }

  const isSignIn = mode === 'sign-in'

  return <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
    <div className="mb-8 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#c1121f] text-white"><ShieldCheck className="size-5" /></div><div><p className="text-lg font-bold tracking-tight text-[#12243d]">H&S Quality Service</p><p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Nettoyage professionnel</p></div></div>
    <div className="mb-7"><h1 className="text-2xl font-bold tracking-tight text-[#152238]">{isSignIn ? 'Bienvenue' : 'Crea tu cuenta'}</h1><p className="mt-2 text-sm text-slate-500">{isSignIn ? 'Accédez à votre espace de gestion H&S Quality Service.' : 'Crea tu acceso al espacio de H&S Quality Service.'}</p></div>
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Email<div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-[#c1121f] focus:ring-2 focus:ring-[#c1121f]/15" placeholder={isSignIn ? 'votre@email.com' : 'tu@email.com'} /></div></label>
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">{isSignIn ? 'Mot de passe' : 'Contraseña'}<div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none transition focus:border-[#c1121f] focus:ring-2 focus:ring-[#c1121f]/15" placeholder={isSignIn ? 'Votre mot de passe' : 'Tu contraseña'} /><button type="button" aria-label={showPassword ? (isSignIn ? 'Masquer le mot de passe' : 'Ocultar contraseña') : (isSignIn ? 'Afficher le mot de passe' : 'Mostrar contraseña')} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      {isSignIn && <div className="-mt-2 text-right"><a href="mailto:soporte@hs-cleaning.ch?subject=Récupération%20de%20mot%20de%20passe" className="text-xs font-semibold text-[#c1121f] hover:underline">Mot de passe oublié ?</a></div>}
      <button disabled={pending} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c1121f] text-sm font-semibold text-white transition hover:bg-[#9f0e19] disabled:cursor-not-allowed disabled:opacity-60">{pending ? (mode === 'sign-up' ? 'Creando cuenta...' : 'Connexion...') : (mode === 'sign-up' ? 'Crear cuenta' : 'Se connecter')}{!pending && <ArrowRight className="size-4" />}</button>
    </form>
    <p className="mt-8 text-center text-xs text-slate-400">{isSignIn ? 'Accès sécurisé aux espaces H&S' : 'Acceso seguro para los espacios H&S'}</p>
    <p className="mt-4 text-center text-sm text-slate-500">{isSignIn ? 'Vous n’avez pas encore de compte ?' : '¿Ya tienes una cuenta?'} <Link href={mode === 'sign-up' ? '/sign-in' : '/sign-up'} className="font-semibold text-[#c1121f] hover:underline">{isSignIn ? 'Créer un compte' : 'Inicia sesión'}</Link></p>
  </div>
}
