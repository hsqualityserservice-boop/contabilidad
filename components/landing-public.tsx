'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import {
  ArrowRight, Building2, Calculator, CalendarCheck, CheckCircle2, FileCheck2,
  Home, Hotel, MapPin, ShieldCheck, Sparkles, Stethoscope, Store,
} from 'lucide-react'

const money = new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' })

const services = [
  { icon: Home, title: 'Fin de bail', desc: 'Remise en état garantie. Garantie de restitution incluse.', tag: 'Garantie' },
  { icon: CalendarCheck, title: 'Entretien régulier', desc: 'Ménage récurrent maisons et appartements, toutes surfaces.' },
  { icon: Building2, title: 'Bureaux', desc: 'Postes de travail, espaces communs, cuisines et sanitaires.' },
  { icon: Stethoscope, title: 'Cabinets médicaux', desc: 'Protocoles sanitaires, traçabilité et surfaces de contact.' },
  { icon: Store, title: 'Vitrines & cristaux', desc: 'Vitrines, devantures et surfaces vitrées sans traces.' },
  { icon: Hotel, title: 'Airbnb & locations', desc: 'Ménage entre deux locations, remise en état express.' },
]

const zones = ['Genève', 'Chêne-Bourg', 'Vernier', 'Lancy', 'Carouge', 'Vaud', 'Neuchâtel', 'Valais']

type Cotizacion = {
  horasTotalesTrabajo: number
  personalRecomendado: number
  costes: { manoObra: number; productosYMateriales: number; tvaCalculado: number; totalPresupuestoCHF: number }
}

export default function LandingPublic() {
  const [servicio, setServicio] = useState('fin_de_bail')
  const [npa, setNpa] = useState('')
  const [metros, setMetros] = useState('')
  const [detalles, setDetalles] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [sauvegarde, setSauvegarde] = useState<'idle' | 'envoi' | 'ok' | 'erreur'>('idle')

  const calculer = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSauvegarde('idle')
    try {
      const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `Devis nettoyage: service=${servicio}, NPA=${npa}, surface=${metros} m², détails=${detalles}. Réponds UNIQUEMENT en JSON: {"horasTotalesTrabajo":N,"personalRecomendado":N,"costes":{"manoObra":N,"productosYMateriales":N,"tvaCalculado":N,"totalPresupuestoCHF":N}}`, language: 'FR' }) })
      if (!response.ok) throw new Error('Request failed')
      const data = await response.json()
      const parsed = JSON.parse(data.text || '{}') as Cotizacion
      if (!parsed.costes?.totalPresupuestoCHF) throw new Error('Invalid response')
      setCotizacion(parsed)
    } catch {
      setError('Le calcul a échoué. Réessayez ou contactez-nous directement.')
    } finally {
      setLoading(false)
    }
  }

  const recevoirDevis = async (event: FormEvent) => {
    event.preventDefault()
    if (!cotizacion) return
    setSauvegarde('envoi')
    try {
      const response = await fetch('/api/demandes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom, email, service: servicio, npa, surface: Number(metros) || 0, details: detalles, devis_ttc: cotizacion.costes.totalPresupuestoCHF }) })
      const data = await response.json()
      setSauvegarde(data.success ? 'ok' : 'erreur')
    } catch {
      setSauvegarde('erreur')
    }
  }

  return (
    <main className="min-h-screen bg-[#fdf6ee] font-sans text-[#2b2118]">
      <header className="sticky top-0 z-10 border-b border-orange-100 bg-[#fdf6ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2"><img src="/hs-logo.png" alt="H&S Quality Service" className="h-9 w-9 rounded-full" /><span className="text-sm font-bold">H&S Quality Service</span></Link>
          <div className="flex items-center gap-3"><a href="#devis" className="hidden text-sm font-semibold text-[#8a6a45] hover:text-[#2b2118] sm:block">Devis</a><a href="#services" className="hidden text-sm font-semibold text-[#8a6a45] hover:text-[#2b2118] sm:block">Services</a><Link href="/sign-in?role=client" className="rounded-xl bg-[#e8852a] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#d0761f]">Espace client</Link></div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-8 pt-12 text-center"><p className="mb-3 inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[#a35a10]"><ShieldCheck className="h-3.5 w-3.5" /> Conforme CCT · Assurance RC CHF 5&apos;000&apos;000</p><h1 className="text-4xl font-black leading-tight sm:text-5xl">Nettoyage professionnel<br />à <span className="text-[#e8852a]">Genève</span></h1><p className="mx-auto mt-4 max-w-xl text-sm text-[#6b5a45] sm:text-base">Fin de bail garantie, bureaux, cabinets médicaux et entretien régulier. Devis immédiat en ligne, sans engagement, TVA 8.1% incluse.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><a href="#devis" className="inline-flex items-center gap-2 rounded-xl bg-[#e8852a] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#d0761f]"><Calculator className="h-4 w-4" /> Calculer mon devis</a><Link href="/sign-up" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#e8852a] px-6 py-3 text-sm font-bold text-[#e8852a] hover:bg-orange-50">Créer un compte <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-5 flex flex-wrap justify-center gap-2">{zones.map((zone) => <span key={zone} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#8a6a45] shadow-sm"><MapPin className="h-3 w-3" />{zone}</span>)}</div></section>

      <section id="services" className="mx-auto max-w-5xl px-4 py-10"><h2 className="text-center text-2xl font-black">Nos services</h2><p className="mt-2 text-center text-sm text-[#6b5a45]">Particuliers et professionnels, dans toute la Suisse romande.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(({ icon: Icon, title, desc, tag }) => <article key={title} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><div className="mb-3 flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-[#e8852a]"><Icon className="h-5 w-5" /></span>{tag && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{tag}</span>}</div><h3 className="font-bold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-[#6b5a45]">{desc}</p></article>)}</div></section>

      <section id="devis" className="mx-auto max-w-5xl px-4 py-10"><div className="mx-auto max-w-xl rounded-3xl border border-orange-100 bg-white p-6 shadow-lg"><h2 className="text-xl font-black">Devis immédiat</h2><p className="mt-1 text-xs text-[#6b5a45]">Réponse en quelques secondes, selon les tarifs du canton.</p><form onSubmit={calculer} className="mt-5 space-y-4"><label className="block text-xs font-bold uppercase tracking-wider text-[#8a6a45]">Type de service<select value={servicio} onChange={(event) => setServicio(event.target.value)} className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fdf9f3] p-3 text-sm font-medium normal-case outline-none focus:ring-2 focus:ring-[#e8852a]"><option value="fin_de_bail">Fin de bail · Garantie de restitution</option><option value="cabinet">Cabinet médical / esthétique</option><option value="bureaux">Bureaux & locaux commerciaux</option><option value="vitrines">Vitrines & cristaux</option></select></label><div className="grid grid-cols-2 gap-4"><label className="text-xs font-bold uppercase tracking-wider text-[#8a6a45]">NPA<input inputMode="numeric" maxLength={4} placeholder="1201" value={npa} onChange={(event) => setNpa(event.target.value.replace(/\D/g, ''))} required className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fdf9f3] p-3 text-center text-sm font-semibold outline-none focus:ring-2 focus:ring-[#e8852a]" /></label><label className="text-xs font-bold uppercase tracking-wider text-[#8a6a45]">Surface (m²)<input type="number" min="1" placeholder="65" value={metros} onChange={(event) => setMetros(event.target.value)} required className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fdf9f3] p-3 text-center text-sm font-semibold outline-none focus:ring-2 focus:ring-[#e8852a]" /></label></div><label className="block text-xs font-bold uppercase tracking-wider text-[#8a6a45]">Détails · optionnel<textarea value={detalles} onChange={(event) => setDetalles(event.target.value)} placeholder="Ex.: 3 grandes vitrines, traces de peinture…" rows={3} className="mt-2 w-full resize-none rounded-xl border border-orange-100 bg-[#fdf9f3] p-3 text-xs normal-case outline-none focus:ring-2 focus:ring-[#e8852a]" /></label><button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8852a] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#d0761f] disabled:opacity-60"><Calculator className="h-4 w-4" /> {loading ? 'Calcul des tarifs…' : 'Calculer le devis immédiat'}</button></form>{error && <p role="alert" className="mt-3 text-center text-xs font-semibold text-red-600">{error}</p>}{cotizacion && <div className="mt-6 space-y-4" aria-live="polite"><div className="rounded-2xl bg-[#2b2118] p-5 text-center text-white"><p className="text-xs font-bold uppercase tracking-widest text-orange-300">Devis estimé · TVA incluse</p><p className="mt-1 text-4xl font-black">{money.format(cotizacion.costes.totalPresupuestoCHF)}</p>{servicio === 'fin_de_bail' && <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[10px] font-semibold text-emerald-300"><CheckCircle2 className="h-3 w-3" /> Garantie de restitution incluse</p>}</div><ul className="space-y-2 text-xs text-[#6b5a45]"><li className="flex justify-between"><span>Durée estimée</span><strong>{cotizacion.horasTotalesTrabajo} h</strong></li><li className="flex justify-between"><span>Professionnels</span><strong>{cotizacion.personalRecomendado}</strong></li><li className="flex justify-between border-t border-dashed pt-2"><span>Main-d&apos;œuvre HT</span><span>{money.format(cotizacion.costes.manoObra)}</span></li><li className="flex justify-between"><span>Produits &amp; matériel</span><span>{money.format(cotizacion.costes.productosYMateriales)}</span></li><li className="flex justify-between font-semibold"><span>TVA 8.1%</span><span>{money.format(cotizacion.costes.tvaCalculado)}</span></li></ul>{sauvegarde === 'ok' ? <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Devis enregistré ! Retrouvez-le dans votre espace client.</p> : <form onSubmit={recevoirDevis} className="space-y-2 rounded-xl bg-orange-50 p-3"><p className="text-xs font-bold text-[#8a6a45]">Recevoir ce devis et le suivi en ligne :</p><input required value={nom} onChange={(event) => setNom(event.target.value)} placeholder="Nom" className="w-full rounded-lg border border-orange-100 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#e8852a]" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" className="w-full rounded-lg border border-orange-100 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#e8852a]" /><button disabled={sauvegarde === 'envoi'} className="w-full rounded-lg bg-[#2b2118] py-2.5 text-xs font-bold text-white hover:bg-black disabled:opacity-60">{sauvegarde === 'envoi' ? 'Enregistrement…' : 'Recevoir mon devis'}</button>{sauvegarde === 'erreur' && <p className="text-center text-[10px] font-semibold text-red-600">Erreur. Réessayez.</p>}</form>}</div>}</div></section>

      <section className="mx-auto max-w-5xl px-4 py-10"><h2 className="text-center text-2xl font-black">Comment ça marche</h2><div className="mt-8 grid gap-4 sm:grid-cols-3">{[{ icon: Calculator, title: '1 · Devis en ligne', desc: 'Calculez votre prix en 30 secondes, selon votre canton.' }, { icon: FileCheck2, title: '2 · Confirmation', desc: 'Notre équipe valide et planifie l’intervention avec vous.' }, { icon: Sparkles, title: '3 · Suivi en direct', desc: 'Photos avant/après et statut en temps réel dans votre espace.' }].map(({ icon: Icon, title, desc }) => <article key={title} className="rounded-2xl border border-orange-100 bg-white p-5 text-center shadow-sm"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-[#e8852a]"><Icon className="h-5 w-5" /></span><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-xs text-[#6b5a45]">{desc}</p></article>)}</div></section>

      <footer className="mt-6 border-t border-orange-100 bg-white"><div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-xs text-[#8a6a45]"><img src="/hs-logo.png" alt="H&S Quality Service" className="h-10 w-10 rounded-full" /><p className="font-bold text-[#2b2118]">H&S Quality Service Sàrl</p><p>Av. du Simplon 9 · 1225 Chêne-Bourg · Genève</p><p className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Assurance Baloise RC CHF 5&apos;000&apos;000 · Conforme nLPD</p><div className="mt-2 flex gap-4 font-semibold"><Link href="/sign-in?role=client">Espace client</Link><Link href="/sign-in?role=staff">Collaborateurs</Link><Link href="/sign-in?role=admin">Administration</Link></div><p className="mt-3 text-[10px]">© 2026 H&S Quality Service Sàrl · Tous droits réservés</p></div></footer>
    </main>
  )
}
