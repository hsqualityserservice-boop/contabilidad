'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CalendarDays, FileText, Home, Receipt } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type Tab = 'quote' | 'requests' | 'interventions' | 'invoices'
type RequestRow = { id: number; created_at: string; service: string; devis_ttc: number; statut: string }
type Intervention = { id: number; date_planifiee: string; service: string; montant_ttc: number; statut: string }

const tabs = [
  { id: 'quote' as const, label: 'Mon devis', icon: Home },
  { id: 'requests' as const, label: 'Mes demandes', icon: FileText },
  { id: 'interventions' as const, label: 'Mes interventions', icon: CalendarDays },
  { id: 'invoices' as const, label: 'Mes factures', icon: Receipt },
]

const extrasList = [['Four', 45], ['Réfrigérateur', 35], ['Cristaux', 55], ['Repassage', 40]] as const

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
  const [extras, setExtras] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const total = useMemo(() => {
    const cantonFactor = canton === 'Valais' ? 1.14 : canton === 'Vaud' ? 1.08 : canton === 'Neuchâtel' ? 1.04 : 1
    const frequencyFactor = frequency === 'Hebdo' ? .92 : frequency === '2–3×' ? .85 : frequency === 'Quotidien' ? .78 : 1
    const extrasTotal = Object.values(extras).reduce((sum, value) => sum + value, 0)
    const rates: Record<string, number> = { Bureaux: 1.1, 'Cabinet médical': 1.35, Commerce: 1.2, 'Hôtel / restaurant': 1.15 }
    const base = mode === 'professionnel' ? surface * (rates[service] ?? 1.1) * cantonFactor * frequencyFactor + sanitaires * 18 : 40 + surface * .42
    const ht = Math.max(40, base + extrasTotal)
    return { ht, vat: ht * .081, total: ht * 1.081, monthly: ht * 1.081 * (frequency === 'Hebdo' ? 4.33 : frequency === '2–3×' ? 10 : frequency === 'Quotidien' ? 30 : 1) }
  }, [canton, extras, frequency, mode, sanitaires, service, surface])

  useEffect(() => {
    if (!email) return
    Promise.all([
      fetch(`/api/demandes?email=${encodeURIComponent(email)}`).then((response) => response.json()),
      fetch(`/api/interventions?email=${encodeURIComponent(email)}`).then((response) => response.json()),
    ]).then(([demandes, visits]) => { setRequests(demandes.demandes ?? []); setInterventions(visits.interventions ?? []) }).catch(() => undefined)
  }, [email])

  const generateQuote = async () => {
    setSaving(true)
    try {
      const amount = Number(total.total.toFixed(2))
      await fetch('/api/demandes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: session?.user?.name ?? '', email, service, npa: canton, surface, details: `Mode ${mode}; fréquence ${frequency}`, devis_ttc: amount }) })
      await fetch('/api/interventions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, date_planifiee: new Date().toISOString().slice(0, 10), service, montant_ttc: amount, statut: 'devis' }) })
      window.print()
    } finally { setSaving(false) }
  }

  const invoices = interventions.filter((item) => item.statut === 'facturée')
  const toggleExtra = (name: string, price: number) => setExtras((current) => ({ ...current, [name]: current[name] ? 0 : price }))

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-background px-4 py-6 text-foreground sm:px-6">
      <header className="mb-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Espace client</p><h1 className="mt-2 text-2xl font-black">Bonjour {session?.user?.name ?? ''}</h1><p className="mt-1 text-sm text-muted-foreground">Gérez vos devis, demandes et interventions.</p></header>
      <nav className="mb-6 flex gap-2 overflow-x-auto pb-1" aria-label="Navigation client">{tabs.map(({ id, label, icon: Icon }) => { const count = id === 'requests' ? requests.length : id === 'interventions' ? interventions.length : id === 'invoices' ? invoices.length : 0; return <button key={id} type="button" onClick={() => setActive(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${active === id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-primary/10'}`}><Icon className="size-4" />{label}{count > 0 ? ` (${count})` : ''}</button> })}</nav>

      {active === 'quote' && <section className="rounded-3xl border border-border bg-card p-5 shadow-sm"><div className="mb-5 flex rounded-xl bg-secondary p-1"><button type="button" onClick={() => setMode('particulier')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'particulier' ? 'bg-primary text-primary-foreground' : ''}`}>Particulier</button><button type="button" onClick={() => setMode('professionnel')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'professionnel' ? 'bg-primary text-primary-foreground' : ''}`}>Professionnel</button></div><div className="grid gap-4 sm:grid-cols-3"><Field label="Prestation"><select value={service} onChange={(event) => setService(event.target.value)} className="input"><option>Fin de bail</option><option>Entretien régulier</option><option>Bureaux</option><option>Cabinet médical</option><option>Commerce</option><option>Hôtel / restaurant</option></select></Field><Field label="Canton"><select value={canton} onChange={(event) => setCanton(event.target.value)} className="input"><option>Genève</option><option>Vaud</option><option>Neuchâtel</option><option>Valais</option></select></Field><Field label="Surface m²"><input type="number" min="1" value={surface} onChange={(event) => setSurface(Number(event.target.value))} className="input" /></Field></div>{mode === 'professionnel' && <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-sm font-semibold">Fréquence</p><div className="flex flex-wrap gap-2">{['Ponctuel', 'Hebdo', '2–3×', 'Quotidien'].map((item) => <button type="button" key={item} onClick={() => setFrequency(item)} className={`rounded-full border px-3 py-2 text-xs font-bold ${frequency === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{item}</button>)}</div></div><Field label="Sanitaires"><input type="number" min="0" value={sanitaires} onChange={(event) => setSanitaires(Number(event.target.value))} className="input" /></Field></div>}<div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{extrasList.map(([name, price]) => <label key={name} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-xs font-semibold"><input type="checkbox" checked={Boolean(extras[name])} onChange={() => toggleExtra(name, price)} />{name} +CHF {price}</label>)}</div><div className="mt-6 rounded-2xl bg-primary p-5 text-primary-foreground"><p className="text-xs font-bold uppercase">Total TTC</p><p className="text-4xl font-black">CHF {total.total.toFixed(2)}</p><p className="mt-1 text-sm">HT CHF {total.ht.toFixed(2)} + TVA 8.1% CHF {total.vat.toFixed(2)}</p>{mode === 'professionnel' && frequency !== 'Ponctuel' && <p className="mt-2 text-sm font-bold">≈ CHF {total.monthly.toFixed(2)} / mois</p>}</div><button type="button" onClick={generateQuote} disabled={saving || !email} className="mt-5 w-full rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background disabled:opacity-50">{saving ? 'Génération…' : 'Générer le devis PDF'}</button></section>}
      {active === 'requests' && <DataTable title="Mes demandes" headers={['Date', 'Service', 'Montant TTC', 'Statut']} rows={requests.map((item) => [new Date(item.created_at).toLocaleDateString('fr-CH'), item.service, `CHF ${Number(item.devis_ttc).toFixed(2)}`, item.statut])} />}
      {active === 'interventions' && <DataTable title="Mes interventions" headers={['Date', 'Service', 'Montant TTC', 'Statut']} rows={interventions.map((item) => [item.date_planifiee, item.service, `CHF ${Number(item.montant_ttc).toFixed(2)}`, item.statut === 'planifiée' ? 'Planifiée' : item.statut === 'effectuée' ? 'Effectuée' : item.statut === 'incident' ? 'Incident' : item.statut])} />}
      {active === 'invoices' && <DataTable title="Mes factures" headers={['N° facture', 'Date', 'Montant TTC', 'Action']} rows={invoices.map((item) => [`F-${item.id}`, item.date_planifiee, `CHF ${Number(item.montant_ttc).toFixed(2)}`, <button key={item.id} type="button" onClick={() => window.print()} className="font-bold text-primary">Télécharger PDF</button>])} />}
    </main>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="text-sm font-semibold">{label}{children}</label> }
function DataTable({ title, headers, rows }: { title: string; headers: string[]; rows: (string | ReactNode)[][] }) { return <section className="rounded-3xl border border-border bg-card p-5 shadow-sm"><h2 className="text-xl font-black">{title}</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b border-border">{headers.map((header) => <th key={header} className="px-3 py-3 font-bold text-muted-foreground">{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index} className="border-b border-border last:border-0">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="px-3 py-10 text-center text-muted-foreground">Aucune donnée pour le moment.</td></tr>}</tbody></table></div></section> }
