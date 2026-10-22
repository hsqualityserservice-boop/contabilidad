'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarDays, FileText, Home, Loader2, Receipt, Sparkles } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type Tab = 'quote' | 'requests' | 'interventions' | 'invoices'
type RequestRow = { id: number; created_at: string; service: string; devis_ttc: number; statut: string }
type Intervention = { id: number; date_planifiee: string; service: string; montant_ttc: number; statut: string }

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'quote', label: 'Mon devis', icon: Home },
  { id: 'requests', label: 'Mes demandes', icon: FileText },
  { id: 'interventions', label: 'Mes interventions', icon: CalendarDays },
  { id: 'invoices', label: 'Mes factures', icon: Receipt },
]

export default function ClientDashboard() {
  const { data: session } = authClient.useSession()
  const email = session?.user?.email ?? ''
  const [active, setActive] = useState<Tab>('quote')
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [service, setService] = useState('Fin de bail')
  const [canton, setCanton] = useState('Genève')
  const [surface, setSurface] = useState(60)
  const [mode, setMode] = useState<'particulier' | 'professionnel'>('particulier')
  const [frequency, setFrequency] = useState('Ponctuel')
  const [sanitaires, setSanitaires] = useState(1)
  const [extras, setExtras] = useState<Record<string, number>>({ Four: 0, Réfrigérateur: 0, Cristaux: 0, Repassage: 0 })
  const [saving, setSaving] = useState(false)

  const total = useMemo(() => {
    const extrasTotal = Object.values(extras).reduce((sum, value) => sum + value, 0)
    const cantonFactor = canton === 'Valais' ? 1.14 : canton === 'Vaud' ? 1.08 : canton === 'Neuchâtel' ? 1.04 : 1
    const frequencyFactor = frequency === 'Hebdo' ? .92 : frequency === '2–3×' ? .85 : frequency === 'Quotidien' ? .78 : 1
    const base = mode === 'professionnel' ? surface * ({ Bureaux: 1.1, 'Cabinet médical': 1.35, Commerce: 1.2, 'Hôtel / restaurant': 1.15 } as Record<string, number>)[service] * cantonFactor * frequencyFactor + sanitaires * 18 : 40 + surface * 42 / 100 + extrasTotal
    const ht = Math.max(40, base + extrasTotal)
    return { ht, vat: ht * .081, total: ht * 1.081, monthly: ht * 1.081 * (frequency === 'Ponctuel' ? 1 : frequency === 'Hebdo' ? 4.33 : frequency === '2–3×' ? 10 : 30) }
  }, [canton, extras, frequency, mode, sanitaires, service, surface])

  useEffect(() => { if (!email) return; Promise.all([fetch(`/api/demandes?email=${encodeURIComponent(email)}`).then((r) => r.json()), fetch(`/api/interventions?email=${encodeURIComponent(email)}`).then((r) => r.json())]).then(([d, i]) => { setRequests(d.demandes ?? []); setInterventions(i.interventions ?? []) }).catch(() => undefined) }, [email])

  const generateQuote = async () => {
    setSaving(true)
    try {
      await fetch('/api/demandes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: session?.user?.name ?? '', email, service, npa: canton, surface, details: `Mode ${mode}; fréquence ${frequency}`, devis_ttc: Number(total.total.toFixed(2)) }) })
      await fetch('/api/interventions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, date_planifiee: new Date().toISOString().slice(0, 10), service, montant_ttc: Number(total.total.toFixed(2)), statut: 'devis' }) })
      window.print()
    } finally { setSaving(false) }
  }

  const toggleExtra = (name: string, price: number) => setExtras((current) => ({ ...current, [name]: current[name] ? 0 : price }))
  const invoices = interventions.filter((item) => item.statut === 'facturée')

  return <main className="mx-auto min-h-screen max-w-5xl bg-background px-4 py-6 text-foreground sm:px-6"><header className="mb-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Espace client</p><h1 className="mt-2 text-2xl font-black tracking-tight">Bonjour {session?.user?.name ?? ''}</h1><p className="mt-1 text-sm text-muted-foreground">Gérez vos devis, demandes et interventions.</p></header>
    <nav className="mb-6 flex gap-2 overflow-x-auto pb-1" aria-label="Navigation client">{tabs.map(({ id, label, icon: Icon }) => { const count = id === 'requests' ? requests.length : id === 'interventions' ? interventions.length : id === 'invoices' ? invoices.length : 0; return <button key={id} type="button" onClick={() => setActive(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${active === id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-primary/10'}`}><Icon className="size-4" />{label}{count ? ` (${count})` : ''}</button> })}</nav>
    {active === 'quote' && <section className="rounded-3xl border border-border bg-card p-5 shadow-sm"><div className="mb-5 flex rounded-xl bg-secondary p-1"><button type="button" onClick={() => setMode('particulier')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'particulier' ? 'bg-primary text-primary-foreground' : ''}`}>Particulier</button><button type="button" onClick={() => setMode('professionnel')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'professionnel' ? 'bg-primary text-primary-foreground' : ''}`}>Professionnel</button></div><div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-semibold">Prestation<select value={service} onChange={(e) => setService(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background p-3"><option>Fin de bail</option><option>Entretien régulier</option><option>Bureaux</option><option>Cabinet médical</option><option>Commerce</option><option>Hôtel / restaurant</option></select></label><label className="text-sm font-semibold">Canton<select value={canton} onChange={(e) => setCanton(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background p-3"><option>Genève</option><option>Vaud</option><option>Neuchâtel</option><option>Valais</option></select></label><label className="text-sm font-semibold">Surface m²<input type="number" min="1" value={surface} onChange={(e) => setSurface(Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background p-3" /></label></div>{mode === 'professionnel' && <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-sm font-semibold">Fréquence</p><div className="flex flex-wrap gap-2">{['Ponctuel', 'Hebdo', '2–3×', 'Quotidien'].map((item) => <button type="button" key={item} onClick={() => setFrequency(item)} className={`rounded-full border px-3 py-2 text-xs font-bold ${frequency === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{item}</button>)}</div></div><label className="text-sm font-semibold">Sanitaires<input type="number" min="0" value={sanitaires} onChange={(e) => setSanitaires(Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background p-3" /></label></div>}<div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{[['Four',45],['Réfrigérateur',35],['Cristaux',55],['Repassage',40]].map(([name, price]) => <label key={name as string} className="flex items-center gap-2 rounded-lg border border-border p-3 text-xs font-semibold"><input type="checkbox" checked={Boolean(extras[name as string])} onChange={() => toggleExtra(name as string, price as number)} />{name} +{price} CHF</label>)}</div><div className="mt-6 rounded-2xl bg-foreground p-5 text-background"><p className="text-xs uppercase tracking-wider opacity-70">Total TTC</p><p className="mt-1 text-4xl font-black">CHF {total.total.toFixed(2)}</p><p className="mt-2 text-sm opacity-80">HT CHF {total.ht.toFixed(2)} + TVA 8.1% CHF {total.vat.toFixed(2)}</p>{mode === 'professionnel' && frequency !== 'Ponctuel' && <p className="mt-2 font-bold text-primary-foreground">≈ CHF {total.monthly.toFixed(2)}/mois</p>}</div><button type="button" onClick={generateQuote} disabled={saving || !email} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50">{saving && <Loader2 className="size-4 animate-spin" />}Générer le devis PDF</button></section>}
    {active === 'requests' && <DataTable title="Mes demandes" headers={['Date','Service','Montant TTC','Statut']} rows={requests.map((item) => [new Date(item.created_at).toLocaleDateString('fr-CH'), item.service, `CHF ${Number(item.devis_ttc).toFixed(2)}`, item.statut])} />}
    {active === 'interventions' && <DataTable title="Mes interventions" headers={['Date','Service','Montant TTC','Statut']} rows={interventions.map((item) => [item.date_planifiee, item.service, `CHF ${Number(item.montant_ttc).toFixed(2)}`, item.statut === 'planifiée' ? '🟡 planifiée' : item.statut === 'effectuée' ? '✅ effectuée' : item.statut === 'incident' ? '🔴 incident' : item.statut])} />}
    {active === 'invoices' && <DataTable title="Mes factures" headers={['N° facture','Date','Montant TTC','Action']} rows={invoices.map((item) => [`HS-${item.id}`, item.date_planifiee, `CHF ${Number(item.montant_ttc).toFixed(2)}`, <button type="button" onClick={() => window.print()} className="font-bold text-primary">Télécharger PDF</button>])} />}
  </main>
}

function DataTable({ title, headers, rows }: { title: string; headers: string[]; rows: (string | ReactNode)[][] }) { return <section className="rounded-3xl border border-border bg-card p-5 shadow-sm"><h2 className="text-xl font-black">{title}</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b border-border">{headers.map((header) => <th key={header} className="px-3 py-3 font-bold text-muted-foreground">{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index} className="border-b border-border last:border-0">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="px-3 py-10 text-center text-muted-foreground">Aucune donnée pour le moment.</td></tr>}</tbody></table></div></section> }
