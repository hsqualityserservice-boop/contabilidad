'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react'
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
  }

  return <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
    <div className="mb-8 flex items-center gap-3"><img src="/hs-quality-service.jpg" alt="H&S Quality Service" className="size-11 rounded-xl object-cover shadow-md" /><div><p className="text-lg font-bold tracking-tight text-[#12243d]">H&amp;S</p><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Quality Service</p></div></div>
    <div className="mb-7"><h1 className="text-2xl font-bold tracking-tight text-[#152238]">{mode === 'sign-up' ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h1><p className="mt-2 text-sm text-slate-500">{mode === 'sign-up' ? 'Empieza a gestionar tu negocio con NEXUS.OS.' : 'Accede a tu panel de gestión empresarial.'}</p></div>
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Email<div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-[#20b8ae] focus:ring-2 focus:ring-[#20b8ae]/15" placeholder="tu@email.com" /></div></label>
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Contraseña<div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input required minLength={8} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none transition focus:border-[#20b8ae] focus:ring-2 focus:ring-[#20b8ae]/15" placeholder="Tu contraseña" /><button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      <button disabled={pending} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#12243d] text-sm font-semibold text-white transition hover:bg-[#1b3455] disabled:cursor-not-allowed disabled:opacity-60">{pending ? (mode === 'sign-up' ? 'Creando cuenta...' : 'Accediendo...') : (mode === 'sign-up' ? 'Crear cuenta' : 'Iniciar sesión')}{!pending && <ArrowRight className="size-4" />}</button>
    </form>
    <p className="mt-8 text-center text-xs text-slate-400">Acceso seguro para administradores de NEXUS.OS</p>
    <p className="mt-4 text-center text-sm text-slate-500">{mode === 'sign-up' ? '¿Ya tienes una cuenta?' : '¿Aún no tienes una cuenta?'} <Link href={mode === 'sign-up' ? '/sign-in' : '/sign-up'} className="font-semibold text-[#20b8ae] hover:underline">{mode === 'sign-up' ? 'Inicia sesión' : 'Crear cuenta'}</Link></p>
  </div>
}
