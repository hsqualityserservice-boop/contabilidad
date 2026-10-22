'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Bot, CalendarDays, CreditCard, FileText, Home, Receipt, Sparkles } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type Tab = 'quote' | 'requests' | 'interventions' | 'invoices' | 'reservation' | 'payment' | 'assistant'
type RequestRow = { id: number; created_at: string; service: string; devis_ttc: number; statut: string }
type Intervention = { id: number; date_planifiee: string; service: string; montant_ttc: number; statut: string }

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'quote', label: 'Mon devis', icon: Home },
  { id: 'requests', label: 'Mes demandes', icon: FileText },
  { id: 'interventions', label: 'Mes interventions', icon: CalendarDays },
  { id: 'invoices', label: 'Mes factures', icon: Receipt },
  { id: 'reservation', label: 'Réservation', icon: CalendarDays },
  { id: 'payment', label: 'Paiement', icon: CreditCard },
  { id: 'assistant', label: 'Assistant', icon: Bot },
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
  const [assistantQuestion, setAssistantQuestion] = useState('')
  const [assistantAnswer, setAssistantAnswer] = useState('')
  const [reservation, setReservation] = useState({ date: '', slot: 'Matin · 08:00–12:00' })

  const total = useMemo(() => {
    const cantonFactor = canton === 'Valais' ? 1.14 : canton === 'Vaud' ? 1.08 : canton === 'Neuchâtel' ? 1.04 : 1
    const frequencyFactor = frequency === 'Hebdo' ? .92 : frequency === '2–3×' ? .85 : frequency === 'Quotidien' ? .78 : 1
    const extrasTotal = Object.values(extras).reduce((sum, value) => sum + value, 0)
    const rates: Record<string, number> = { Bureaux: 1.1, 'Cabinet médical': 1.35, Commerce: 1.2, 'Hôtel / restaurant': 1.15 }
    const base = mode === 'professionnel' ? surface * (rates[service] ?? 1.1) * cantonFactor * frequencyFactor + sanitaires * 18 : 40 + surface * .42
    const ht = Math.max(40, base + extrasTotal)
    const monthly = frequency === 'Hebdo' ? ht * 1.081 * 4.33 : frequency === '2–3×' ? ht * 1.081 * 10 : frequency === 'Quotidien' ? ht * 1.081 * 30 : null
    return { ht, vat: ht * .081, total: ht * 1.081, monthly }
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

  const askAssistant = async (event: React.FormEvent) => {
    event.preventDefault()
    const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: assistantQuestion, language: 'FR' }) })
    const data = await response.json()
    setAssistantAnswer(data.text || 'H&S Quality Service peut vous aider avec votre devis.')
  }

  const invoices = interventions.filter((item) => item.statut === 'facturée')
  const toggleExtra = (name: string, price: number) => setExtras((current) => ({ ...current, [name]: current[name] ? 0 : price }))
  const countFor = (id: Tab) => id === 'requests' ? requests.length : id === 'interventions' ? interventions.length : id === 'invoices' ? invoices.length : 0

  return <main className="mx-auto min-h-screen max-w-6xl bg-background px-4 py-6 text-foreground sm:px-6">
    <header className="mb-4"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Espace client</p><h1 className="mt-2 text-2xl font-black">Bonjour {session?.user?.name ?? ''}</h1><p className="mt-1 text-sm text-muted-foreground">Gérez vos devis, demandes, interventions et paiements.</p></header>
    <nav className="sticky top-0 z-10 mb-6 flex gap-2 overflow-x-auto border-y border-border bg-background/95 py-3 backdrop-blur" aria-label="Navigation client">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActive(id)} aria-current={active === id ? 'page' : undefined} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${active === id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-primary/10'}`}><Icon className="size-4" />{label}{countFor(id) > 0 ? ` (${countFor(id)})` : ''}</button>)}</nav>

    {active === 'quote' && <section className="rounded-3xl border border-border bg-card p-5 shadow-sm"><div className="mb-5 flex rounded-xl bg-secondary p-1"><button type="button" onClick={() => setMode('particulier')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'particulier' ? 'bg-primary text-primary-foreground' : ''}`}>Particulier</button><button type="button" onClick={() => setMode('professionnel')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${mode === 'professionnel' ? 'bg-primary text-primary-foreground' : ''}`}>Professionnel</button></div><div className="grid gap-4 sm:grid-cols-3"><Field label="Prestation"><select value={service} onChange={(event) => setService(event.target.value)} className="input"><option>Fin de bail</option><option>Entretien régulier</option><option>Bureaux</option><option>Cabinet médical</option><option>Commerce</option><option>Hôtel / restaurant</option></select></Field><Field label="Canton"><select value={canton} onChange={(event) => setCanton(event.target.value)} className="input"><option>Genève</option><option>Vaud</option><option>Neuchâtel</option><option>Valais</option></select></Field><Field label="Surface m²"><input type="number" min="1" value={surface} onChange={(event) => setSurface(Number(event.target.value))} className="input" /></Field></div>{mode === 'professionnel' && <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-sm font-semibold">Fréquence</p><div className="flex flex-wrap gap-2">{['Ponctuel', 'Hebdo', '2–3×', 'Quotidien'].map((item) => <button type="button" key={item} onClick={() => setFrequency(item)} className={`rounded-full border px-3 py-2 text-xs font-bold ${frequency === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{item}</button>)}</div></div><Field label="Sanitaires"><input type="number" min="0" value={sanitaires} onChange={(event) => setSanitaires(Number(event.target.value))} className="input" /></Field></div>}<div className="mt-5 grid gap-2 sm:grid-cols-2">{extrasList.map(([name, price]) => <label key={name} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"><span><input type="checkbox" checked={Boolean(extras[name])} onChange={() => toggleExtra(name, price)} className="mr-2" />{name}</span><span className="font-bold text-primary">+ CHF {price}</span></label>)}</div><div className="mt-5 rounded-2xl bg-secondary p-4"><div className="flex items-end justify-between"><span><span className="block text-xs uppercase tracking-wider text-muted-foreground">Total TTC</span><strong className="text-3xl font-black">CHF {total.total.toFixed(2)}</strong></span><span className="text-right text-xs text-muted-foreground">HT CHF {total.ht.toFixed(2)}<br />TVA 8.1% CHF {total.vat.toFixed(2)}{total.monthly !== null && <><br />≈ CHF {total.monthly.toFixed(2)}/mois</>}</span></div></div><button type="button" disabled={saving || !email} onClick={generateQuote} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">{saving ? 'Génération…' : 'Générer le devis PDF'}</button></section>}
    {active === 'requests' && <DataTable title="Mes demandes" headers={['Date', 'Service', 'Montant TTC', 'Statut']} rows={requests.map((item) => [new Date(item.created_at).toLocaleDateString('fr-CH'), item.service, `CHF ${Number(item.devis_ttc).toFixed(2)}`, item.statut])} />}
    {active === 'interventions' && <DataTable title="Mes interventions" headers={['Date', 'Service', 'Montant TTC', 'Statut']} rows={interventions.map((item) => [item.date_planifiee, item.service, `CHF ${Number(item.montant_ttc).toFixed(2)}`, item.statut === 'planifiée' ? '🟡 Planifiée' : item.statut === 'effectuée' ? '✅ Effectuée' : item.statut === 'incident' ? '🔴 Incident' : item.statut])} />}
    {active === 'invoices' && <DataTable title="Mes factures" headers={['N° facture', 'Date', 'Montant TTC', 'Action']} rows={invoices.map((item) => [`F-${item.id}`, item.date_planifiee, `CHF ${Number(item.montant_ttc).toFixed(2)}`, <button key={item.id} type="button" onClick={() => window.print()} className="font-bold text-primary">Télécharger PDF</button>])} />}
    {active === 'reservation' && <Panel title="Réservation"><div className="grid gap-4 sm:grid-cols-2"><Field label="Date souhaitée"><input type="date" value={reservation.date} onChange={(event) => setReservation({ ...reservation, date: event.target.value })} className="input" /></Field><Field label="Créneau"><select value={reservation.slot} onChange={(event) => setReservation({ ...reservation, slot: event.target.value })} className="input"><option>Matin · 08:00–12:00</option><option>Après-midi · 13:00–17:00</option></select></Field></div><button type="button" className="mt-5 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Enregistrer la réservation</button></Panel>}
    {active === 'payment' && <Panel title="Paiement"><p className="text-sm text-muted-foreground">Paiement sécurisé en CHF avec Stripe Checkout. TWINT est proposé lorsqu’il est disponible pour votre compte.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-secondary px-3 py-2 text-sm font-bold">Stripe Checkout</span><span className="rounded-full bg-secondary px-3 py-2 text-sm font-bold">TWINT</span><span className="rounded-full bg-secondary px-3 py-2 text-sm font-bold">CHF</span></div></Panel>}
    {active === 'assistant' && <Panel title="Assistant IA"><div className="flex items-center gap-2 text-sm text-primary"><Sparkles className="size-4" /> Réponse en français</div><form onSubmit={askAssistant} className="mt-5 flex flex-col gap-3 sm:flex-row"><input required value={assistantQuestion} onChange={(event) => setAssistantQuestion(event.target.value)} placeholder="Votre question…" className="input flex-1" /><button className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Envoyer</button></form>{assistantAnswer && <p className="mt-4 rounded-xl bg-secondary p-4 text-sm leading-relaxed">{assistantAnswer}</p>}</Panel>}
  </main>
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="text-sm font-semibold">{label}{children}</label> }
function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-3xl border border-border bg-card p-5 shadow-sm"><h2 className="text-xl font-black">{title}</h2><div className="mt-4">{children}</div></section> }
function DataTable({ title, headers, rows }: { title: string; headers: string[]; rows: (string | ReactNode)[][] }) { return <Panel title={title}><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b border-border">{headers.map((header) => <th key={header} className="px-3 py-3 font-bold text-muted-foreground">{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index} className="border-b border-border last:border-0">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="px-3 py-10 text-center text-muted-foreground">Aucune donnée pour le moment.</td></tr>}</tbody></table></div></Panel> }
