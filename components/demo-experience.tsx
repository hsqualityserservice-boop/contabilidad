'use client'

import { useState } from 'react'
import { CalendarCheck, CheckCircle2, Clock3, ShieldCheck, Sparkles, UserRound, UsersRound } from 'lucide-react'
import Dashboard from '@/components/dashboard'
import { ClientWorkspace } from '@/components/client-workspace'
import { copy } from '@/lib/i18n'

type Role = 'admin' | 'client' | 'collaborator'

const roles = [
  { id: 'admin' as const, label: 'ENTRER COMME ADMINISTRATEUR', description: 'Tableau de bord, paie AVS et facturation QR', icon: ShieldCheck },
  { id: 'client' as const, label: 'ENTRER COMME CLIENT', description: 'Espace client trilingue et assistant de nettoyage', icon: UserRound },
  { id: 'collaborator' as const, label: 'ENTRER COMME COLLABORATEUR', description: 'Pointage de journée et checklist SUVA', icon: UsersRound },
]

export function DemoExperience() {
  const [role, setRole] = useState<Role | null>(null)

  if (role === 'admin') return <Dashboard userName="Carlos" />
  if (role === 'client') return <ClientDemo onBack={() => setRole(null)} />
  if (role === 'collaborator') return <CollaboratorDemo onBack={() => setRole(null)} />

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-5 py-8 text-[#152238] sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-5 border-b border-[#dfe6ee] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="mb-5 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-orange-700 text-white"><Sparkles className="size-5" /></div><span className="text-sm font-bold tracking-wide">H&amp;S QUALITY SERVICE</span></div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Environnement de démonstration</p><h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">Choisissez votre espace de travail</h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">Accédez instantanément aux expériences principales de la plateforme, sans authentification.</p></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="size-2 rounded-full bg-emerald-500" />Sandbox ouvert</div>
        </header>
        <section aria-label="Accès par rôle" className="grid gap-4 lg:grid-cols-3">
          {roles.map(({ id, label, description, icon: Icon }) => <button key={id} type="button" onClick={() => setRole(id)} className="group flex min-h-56 flex-col justify-between rounded-2xl border border-[#dfe6ee] bg-white p-6 text-left shadow-[0_8px_24px_rgba(20,35,55,0.04)] transition hover:-translate-y-1 hover:border-orange-700 hover:shadow-[0_14px_30px_rgba(20,35,55,0.1)]"><div className="flex items-start justify-between"><span className="flex size-12 items-center justify-center rounded-xl bg-[#fff1e8] text-orange-700"><Icon className="size-6" /></span><span className="text-xs font-bold text-slate-400 transition group-hover:text-orange-700">ACCÈS →</span></div><div><h2 className="text-lg font-bold leading-6">{label}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div></button>)}
        </section>
        <p className="text-center text-xs text-slate-400">Les actions effectuées dans cet espace sont simulées et ne modifient aucune donnée de production.</p>
      </div>
    </main>
  )
}

function ClientDemo({ onBack }: { onBack: () => void }) {
  return <div className="min-h-screen bg-[#f5f7fa]"><DemoBar title="Espace Client" onBack={onBack} /><main className="mx-auto max-w-[1480px] p-5 sm:p-8"><div className="mb-8"><p className="mb-1 text-sm font-medium text-orange-700">Démonstration · FR / DE / EN</p><h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Espace client</h1><p className="mt-1 text-sm text-slate-500">Planifiez votre intervention et échangez avec notre assistant.</p></div><ClientWorkspace lang="FR" t={copy.FR} onNotice={() => undefined} /></main></div>
}

function CollaboratorDemo({ onBack }: { onBack: () => void }) {
  const [checked, setChecked] = useState([false, false, false])
  const [clocked, setClocked] = useState(false)
  const items = ['Équipement de protection contrôlé', 'Produits et fiches de sécurité vérifiés', 'Zone de travail sécurisée selon SUVA']
  return <div className="min-h-screen bg-[#f5f7fa] text-[#152238]"><DemoBar title="Espace Personnel" onBack={onBack} /><main className="mx-auto max-w-4xl p-5 sm:p-8"><div className="mb-8"><p className="mb-1 text-sm font-medium text-orange-700">Espace collaborateur</p><h1 className="text-3xl font-bold tracking-tight">Bonjour, Sophie</h1><p className="mt-2 text-sm text-slate-500">Votre journée de travail, claire et sécurisée.</p></div><div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]"><section className="rounded-2xl bg-[#152238] p-6 text-white"><Clock3 className="size-7 text-orange-400" /><p className="mt-8 text-sm text-slate-300">Statut du jour</p><p className="mt-1 text-2xl font-bold">{clocked ? 'En service' : 'Pas encore pointé'}</p><button type="button" onClick={() => setClocked(!clocked)} className="mt-6 w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700">{clocked ? 'Clock-Out' : 'Clock-In'}</button></section><section className="rounded-2xl border border-[#dfe6ee] bg-white p-6"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#fff1e8] text-orange-700"><ShieldCheck className="size-5" /></div><div><h2 className="font-bold">Checklist SUVA</h2><p className="text-sm text-slate-500">Contrôles avant intervention</p></div></div><div className="mt-6 flex flex-col gap-3">{items.map((item, index) => <label key={item} className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm"><input type="checkbox" checked={checked[index]} onChange={() => setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))} className="size-4 accent-orange-700" /><span className={checked[index] ? 'text-slate-400 line-through' : ''}>{item}</span>{checked[index] && <CheckCircle2 className="ml-auto size-4 text-emerald-600" />}</label>)}</div></section></div></main></div>
}

function DemoBar({ title, onBack }: { title: string; onBack: () => void }) {
  return <header className="flex h-20 items-center justify-between border-b border-[#dfe6ee] bg-white px-5 sm:px-8"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-orange-700 text-white"><Sparkles className="size-4" /></div><span className="text-sm font-bold">H&amp;S Quality Service</span><span className="hidden text-sm text-slate-400 sm:inline">/ {title}</span></div><button type="button" onClick={onBack} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-orange-700 hover:text-orange-700">Retour aux accès</button></header>
}
