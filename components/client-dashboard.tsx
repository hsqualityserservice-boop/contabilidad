'use client'

import Link from 'next/link'
import { type FormEvent, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { authClient } from '@/lib/auth-client'

const destinations = {
  commercial: { label: 'Entreprises', items: [['Cliniques', 240], ['Boutiques', 180], ['Restaurants', 220], ['Vitrines / Cristaux', 160]] },
  residential: { label: 'Résidentiel', items: [['Maisons', 150], ['Appartements', 120], ['Fin de Chantier', 280]] },
  vehicles: { label: 'Véhicules', items: [['Nettoyage de voitures à l’intérieur', 90]] },
} as const
const extras = [['oven', 'Four', 45], ['fridge', 'Réfrigérateur', 35], ['windows', 'Cristaux', 55], ['ironing', 'Repassage', 40]] as const
const regions = [['Genève', 0], ['Vaud', 15], ['Neuchâtel', 20], ['Valais — Sion', 35], ['Valais — Verbier', 60], ['Valais — Crans-Montana', 60]] as const
const languages = { FR: { greeting: 'Bonjour', subtitle: 'Votre devis régional, clair et immédiat.', availability: 'Disponibilité', region: 'Canton et destination', slot: 'Créneau préféré', assistant: 'Assistant H&S', ask: 'Votre question…' }, ES: { greeting: 'Hola', subtitle: 'Su presupuesto regional, claro e inmediato.', availability: 'Disponibilidad', region: 'Cantón y destino', slot: 'Horario preferido', assistant: 'Asistente H&S', ask: 'Su pregunta…' }, EN: { greeting: 'Hello', subtitle: 'Your clear, immediate regional quote.', availability: 'Availability', region: 'Canton and destination', slot: 'Preferred time', assistant: 'H&S Assistant', ask: 'Your question…' } } as const

export default function ClientDashboard() {
  const { data: session } = authClient.useSession()
  const [language, setLanguage] = useState<keyof typeof languages>('FR')
  const [destination, setDestination] = useState<keyof typeof destinations>('residential')
  const [service, setService] = useState(destinations.residential.items[0][0])
  const [region, setRegion] = useState(regions[0][0])
  const [slot, setSlot] = useState('Matin · 08:00–12:00')
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const copy = languages[language]
  const name = session?.user?.name?.split(' ')[0] || 'Client'
  const total = useMemo(() => {
    const servicePrice = destinations[destination].items.find(([label]) => label === service)?.[1] ?? destinations[destination].items[0][1]
    const transport = regions.find(([label]) => label === region)?.[1] ?? 0
    const subtotal = servicePrice + transport + selectedExtras.reduce((sum, key) => sum + (extras.find(([id]) => id === key)?.[2] ?? 0), 0)
    return { subtotal, vat: subtotal * 0.081, total: subtotal * 1.081 }
  }, [destination, region, selectedExtras, service])
  const generateQuote = async () => {
    const iban = 'CH39 0026 2262 1458 9201 H'
    const qr = await QRCode.toDataURL(`SPC\n0200\n1\nS\n${iban}\nH&S Service Sàrl\nAv. du Simplon 9\n1225 Chêne-Bourg\nCH\n\n\nCHF\n${total.total.toFixed(2)}\nS\n${name}\n\n\nDevis hs-cleaning.ch`)
    const pdf = new jsPDF()
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20); pdf.text('H&S Service Sàrl', 20, 25)
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10)
    pdf.text('Av. du Simplon 9 · 1225 Chêne-Bourg', 20, 34)
    pdf.text('Assurance Baloise · couverture CHF 5’000’000', 20, 42)
    pdf.text(`Devis pour ${name}`, 20, 58); pdf.text(`${service} · ${region} · ${slot}`, 20, 70)
    pdf.text(`Sous-total HT                 CHF ${total.subtotal.toFixed(2)}`, 20, 92)
    pdf.text(`TVA suisse 8.1%              CHF ${total.vat.toFixed(2)}`, 20, 104)
    pdf.setFont('helvetica', 'bold'); pdf.text(`Total TTC                    CHF ${total.total.toFixed(2)}`, 20, 120)
    pdf.setFont('helvetica', 'normal'); pdf.text(`IBAN: ${iban}`, 20, 138); pdf.addImage(qr, 'PNG', 20, 150, 52, 52); pdf.save('hs-cleaning-devis-qr.pdf')
  }
  const askAssistant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, language }) })
    const data = await response.json(); setAnswer(data.text || 'H&S Service peut vous aider avec votre devis.')
  }
  const signOut = async () => { await authClient.signOut(); window.location.href = '/' }
  return <main className="client-portal">
    <header className="portal-header"><div><p className="eyebrow">H&S SERVICE SÀRL / ESPACE CLIENT</p><h1>{copy.greeting}, {name}</h1><p>{copy.subtitle}</p></div><div className="header-actions"><select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value as keyof typeof languages)}><option>FR</option><option>ES</option><option>EN</option></select><button className="secondary-button" onClick={signOut}>Déconnexion</button></div></header>
    <div className="client-grid"><section className="panel calculator-panel"><div className="panel-header"><div><p className="eyebrow">ESTIMATION EN CHF</p><h2>Ménage sur mesure</h2><p>TVA suisse calculée automatiquement à 8.1%.</p></div><strong className="calculator-total">CHF {total.total.toFixed(2)}</strong></div>
      <div className="destination-tabs">{Object.entries(destinations).map(([key, item]) => <button type="button" key={key} className={destination === key ? 'active' : ''} onClick={() => { const next = key as keyof typeof destinations; setDestination(next); setService(destinations[next].items[0][0]) }}>{item.label}</button>)}</div>
      <label className="field"><span>Prestation</span><select value={service} onChange={(event) => setService(event.target.value)}>{destinations[destination].items.map(([label]) => <option key={label}>{label}</option>)}</select></label>
      <div className="extras-grid">{extras.map(([key, label, price]) => <label className="extra-option" key={key}><input type="checkbox" checked={selectedExtras.includes(key)} onChange={() => setSelectedExtras((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} /><span>{label}</span><small>+ CHF {price}.00</small></label>)}</div>
      <div className="calculator-breakdown"><span>Sous-total HT <strong>CHF {total.subtotal.toFixed(2)}</strong></span><span>TVA 8.1% <strong>CHF {total.vat.toFixed(2)}</strong></span><span>Total TTC <strong>CHF {total.total.toFixed(2)}</strong></span></div><button className="primary-button" onClick={generateQuote}>Générer le devis / Facture</button>
    </section><aside className="client-side"><section className="panel"><p className="eyebrow">{copy.availability}</p><h2>{copy.region}</h2><label className="field"><span>Région</span><select value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map(([label]) => <option key={label}>{label}</option>)}</select></label><label className="field"><span>{copy.slot}</span><select value={slot} onChange={(event) => setSlot(event.target.value)}><option>Matin · 08:00–12:00</option><option>Après-midi · 13:00–17:00</option></select></label></section><section className="panel assistant-panel"><p className="eyebrow">{copy.assistant}</p><h2>Une réponse, dans votre langue.</h2><form onSubmit={askAssistant}><input aria-label={copy.ask} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={copy.ask} /><button className="primary-button" type="submit">Envoyer</button></form>{answer && <p className="assistant-answer">{answer}</p>}</section></aside></div><Link className="personnel-access" href="/admin/dashboard">Espace Personnel &amp; Administration</Link>
  </main>
}
