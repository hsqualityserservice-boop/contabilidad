'use client'

import Link from 'next/link'
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowRight, Building2, Calculator, CalendarCheck, CheckCircle2, FileCheck2, Home, Hotel, MapPin, ShieldCheck, Sparkles, Stethoscope, Store } from 'lucide-react'

const money = new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' })
const services = [
  { icon: Home, title: 'Fin de bail garantie', desc: 'Remise en état garantie avec contrôle final.' },
  { icon: CalendarCheck, title: 'Entretien régulier', desc: 'Maisons et appartements, toutes surfaces.' },
  { icon: Building2, title: 'Bureaux', desc: 'Postes, espaces communs, cuisines et sanitaires.' },
  { icon: Stethoscope, title: 'Cabinets médicaux', desc: 'Protocoles sanitaires et surfaces de contact.' },
  { icon: Store, title: 'Vitrines & cristaux', desc: 'Surfaces vitrées impeccables et sans traces.' },
  { icon: Hotel, title: 'Airbnb', desc: 'Remise en état express entre deux locations.' },
]
const cantonFactors = { geneve: 1, vaud: 1.08, neuchatel: 1.04, valais: 1.12 }
const frequencyFactors = { ponctuel: 1, hebdo: 0.92, deux_trois: 0.85, quotidien: 0.78 }
const professionalRates = { bureaux: 1.1, cabinet: 1.35, commerce: 1.2, hotel: 1.15 }
const extras = [{ key: 'four', label: 'Four', price: 45 }, { key: 'frigo', label: 'Réfrigérateur', price: 35 }, { key: 'cristaux', label: 'Cristaux', price: 55 }, { key: 'repassage', label: 'Repassage', price: 40 }] as const

type Mode = 'particulier' | 'professionnel'
type ExtraKey = (typeof extras)[number]['key']

export default function LandingPublic() {
  const [mode, setMode] = useState<Mode>('particulier')
  const [service, setService] = useState('fin_de_bail')
  const [canton, setCanton] = useState<keyof typeof cantonFactors>('geneve')
  const [surface, setSurface] = useState('65')
  const [frequency, setFrequency] = useState<keyof typeof frequencyFactors>('ponctuel')
  const [sanitaires, setSanitaires] = useState('1')
  const [selectedExtras, setSelectedExtras] = useState<Record<ExtraKey, boolean>>({ four: false, frigo: false, cristaux: false, repassage: false })
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const quote = useMemo(() => {
    const area = Math.max(0, Number(surface) || 0)
    const extrasTotal = extras.reduce((total, extra) => total + (selectedExtras[extra.key] ? extra.price : 0), 0)
    const factor = cantonFactors[canton]
    const ht = mode === 'particulier'
      ? (42 + (service === 'fin_de_bail' ? 40 : 0)) * factor + extrasTotal
      : area * (professionalRates[service as keyof typeof professionalRates] ?? 1.1) * factor * frequencyFactors[frequency] + Number(sanitaires || 0) * 18 + extrasTotal
    const tva = ht * 0.081
    return { ht, tva, total: ht + tva, monthly: ht * (frequency === 'ponctuel' ? 1 : frequency === 'hebdo' ? 4.33 : frequency === 'deux_trois' ? 10.8 : 21.7) * 1.081 }
  }, [canton, frequency, mode, sanitaires, selectedExtras, service, surface])

  const toggleExtra = (event: ChangeEvent<HTMLInputElement>) => setSelectedExtras((current) => ({ ...current, [event.target.name]: event.target.checked }))
  const generateDevis = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (email) {
        await fetch('/api/demandes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: mode === 'professionnel' ? 'Demande professionnelle' : 'Demande particulière', email, service, npa: canton, surface: Number(surface) || 0, details: `Mode ${mode}; fréquence ${frequency}; sanitaires ${sanitaires}`, devis_ttc: Number(quote.total.toFixed(2)) }) })
      }
      window.print()
      setSaved(true)
    } finally { setSaving(false) }
  }

  return <main className="min-h-screen bg-[#fdf6ee] font-sans text-[#2b2118]">
    <header className="sticky top-0 z-10 border-b border-orange-100 bg-[#fdf6ee]/95 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"><Link href="/" className="flex items-center gap-2"><img src="/hs-logo.png" alt="H&S Quality Service" className="h-9 w-9 rounded-full" /><span className="text-sm font-bold">H&S Quality Service</span></Link><Link href="/sign-in?role=client" className="rounded-xl bg-[#e8852a] px-4 py-2 text-sm font-bold text-white">Espace client</Link></div></header>
    <section className="mx-auto max-w-5xl px-4 pb-8 pt-12 text-center"><div className="mb-3 flex flex-wrap justify-center gap-2"><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[#a35a10]">Conforme CCT</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[#a35a10]">Assurance RC CHF 5M</span><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[#a35a10]">Garantie de restitution</span></div><h1 className="text-4xl font-black leading-tight sm:text-5xl">Nettoyage professionnel<br />à <span className="text-[#e8852a]">Genève</span></h1><p className="mx-auto mt-4 max-w-xl text-sm text-[#6b5a45] sm:text-base">Devis immédiat en 30 secondes — Particuliers et Professionnels.</p><a href="#devis" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e8852a] px-6 py-3 text-sm font-bold text-white"><Calculator className="h-4 w-4" /> Calculer mon devis</a></section>
    <section id="services" className="mx-auto max-w-5xl px-4 py-10"><h2 className="text-center text-2xl font-black">Nos services</h2><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(({ icon: Icon, title, desc }) => <article key={title} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><span className="flex size-11 items-center justify-center rounded-xl bg-orange-100 text-[#e8852a]"><Icon className="size-5" /></span><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-[#6b5a45]">{desc}</p></article>)}</div></section>
    <section id="devis" className="mx-auto max-w-5xl px-4 py-10"><form onSubmit={generateDevis} className="mx-auto max-w-3xl rounded-3xl border border-orange-100 bg-white p-6 shadow-lg"><div className="flex rounded-xl bg-[#fdf6ee] p-1"><button type="button" onClick={() => setMode('particulier')} className={`flex-1 rounded-lg px-3 py-3 text-sm font-bold ${mode === 'particulier' ? 'bg-[#e8852a] text-white' : 'text-[#8a6a45]'}`}>Particulier</button><button type="button" onClick={() => setMode('professionnel')} className={`flex-1 rounded-lg px-3 py-3 text-sm font-bold ${mode === 'professionnel' ? 'bg-[#e8852a] text-white' : 'text-[#8a6a45]'}`}>Professionnel</button></div><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3"><label className="text-xs font-bold text-[#8a6a45]">Prestation<select value={service} onChange={(e) => setService(e.target.value)} className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fdf9f3] p-3 text-sm"><option value="fin_de_bail">Fin de bail</option><option value="entretien">Entretien régulier</option><option value="bureaux">Bureaux</option><option value="cabinet">Cabinet médical</option><option value="commerce">Commerce</option><option value="hotel">Hôtel / restaurant</option></select></label><label className="text-xs font-bold text-[#8a6a45]">Canton<select value={canton} onChange={(e) => setCanton(e.target.value as keyof typeof cantonFactors)} className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fdf9f3] p-3 text-sm"><option value="geneve">Genève</option><option value="vaud">Vaud</option><option value="neuchatel">Neuchâtel</option><option value="valais">Valais</option></select></label><label className="text-xs font-bold text-[#8a6a45]">Surface m²<input type="number" min="1" value={surface} onChange={(e) => setSurface(e.target.value)} className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fdf9f3] p-3 text-sm" /></label></div>{mode === 'professionnel' && <div className="mt-4 grid gap-4 md:grid-cols-2"><fieldset><legend className="text-xs font-bold text-[#8a6a45]">Fréquence</legend><div className="mt-2 flex flex-wrap gap-2">{[['ponctuel', 'Ponctuel ×1.00'], ['hebdo', 'Hebdo −8%'], ['deux_trois', '2–3× −15%'], ['quotidien', 'Quotidien −22%']].map(([value, label]) => <button type="button" key={value} onClick={() => setFrequency(value as keyof typeof frequencyFactors)} className={`rounded-full border px-3 py-2 text-xs font-bold ${frequency === value ? 'border-[#e8852a] bg-orange-100 text-[#a35a10]' : 'border-orange-100'}`}>{label}</button>)}</div></fieldset><label className="text-xs font-bold text-[#8a6a45]">Sanitaires<input type="number" min="0" value={sanitaires} onChange={(e) => setSanitaires(e.target.value)} className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fdf9f3] p-3 text-sm" /></label></div>}<fieldset className="mt-5"><legend className="text-xs font-bold text-[#8a6a45]">Extras</legend><div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">{extras.map((extra) => <label key={extra.key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-orange-100 p-3 text-xs"><input type="checkbox" name={extra.key} checked={selectedExtras[extra.key]} onChange={toggleExtra} />{extra.label} +{extra.price}</label>)}</div></fieldset><div className="mt-6 rounded-2xl bg-[#2b2118] p-5 text-center text-white"><p className="text-xs font-bold uppercase tracking-widest text-orange-300">Total TTC</p><p className="mt-1 text-4xl font-black">{money.format(quote.total)}</p><p className="mt-2 text-xs text-orange-100">HT {money.format(quote.ht)} + TVA 8.1% {money.format(quote.tva)}</p>{mode === 'professionnel' && <p className="mt-2 text-sm font-bold text-orange-200">≈ {money.format(quote.monthly)}/mois</p>}</div><label className="mt-5 block text-xs font-bold text-[#8a6a45]">E-mail pour recevoir le devis<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.ch" className="mt-2 w-full rounded-xl border border-orange-100 bg-[#fdf9f3] p-3 text-sm" /></label><button type="submit" disabled={saving} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8852a] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Génération…' : 'Générer le devis PDF'}</button>{saved && <p className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-4" /> Devis prêt à imprimer et demande enregistrée.</p>}</form></section>
    <section className="mx-auto max-w-5xl px-4 py-10"><h2 className="text-center text-2xl font-black">Comment ça marche</h2><div className="mt-8 grid gap-4 sm:grid-cols-3">{['Choisissez votre mode et vos options.', 'Le montant TTC se calcule instantanément.', 'Générez votre devis et recevez le suivi.'].map((text, index) => <article key={text} className="rounded-2xl border border-orange-100 bg-white p-5 text-center"><span className="mx-auto flex size-10 items-center justify-center rounded-full bg-orange-100 font-black text-[#e8852a]">{index + 1}</span><p className="mt-3 text-sm font-bold">{text}</p></article>)}</div></section>
    <footer className="border-t border-orange-100 bg-white"><div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-xs text-[#8a6a45]"><p className="font-bold text-[#2b2118]">H&S Quality Service Sàrl</p><p>Av. du Simplon 9 · 1225 Chêne-Bourg · Genève</p><p>Assurance Baloise RC CHF 5&apos;000&apos;000 · Conforme nLPD</p><div className="mt-2 flex gap-4 font-semibold"><Link href="/sign-in?role=client">Espace client</Link><Link href="/sign-in?role=staff">Collaborateurs</Link><Link href="/sign-in?role=admin">Administration</Link></div></div></footer>
  </main>
}
