'use client'

import Link from 'next/link'
import { type FormEvent, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { authClient } from '@/lib/auth-client'
import { LogIn, Sparkles } from 'lucide-react'

const destinations = {
  commercial: { label: { FR: 'Entreprises', ES: 'Empresas', EN: 'Business' }, items: [['Cliniques & Cabinets', 3.1], ['Boutiques / Magasins', 2.7], ['Restaurants', 3.4], ['Vitrines / Cristaux', 2.4]] },
  residential: { label: { FR: 'Résidentiel', ES: 'Residencial', EN: 'Residential' }, items: [['Maisons', 2.6], ['Appartements', 2.35], ['Fin de Chantier', 4.1]] },
  vehicles: { label: { FR: 'Véhicules', ES: 'Vehículos', EN: 'Vehicles' }, items: [['Nettoyage de voitures à l’intérieur', 95]] },
} as const
const extras = [['oven', { FR: 'Four', ES: 'Horno', EN: 'Oven' }, 45], ['fridge', { FR: 'Réfrigérateur', ES: 'Nevera', EN: 'Fridge' }, 35], ['windows', { FR: 'Cristaux', ES: 'Cristales', EN: 'Windows' }, 55], ['ironing', { FR: 'Repassage', ES: 'Planchado', EN: 'Ironing' }, 40]] as const
const regions = [['Genève', 38, 0], ['Vaud', 42, 0], ['Neuchâtel', 40, 0], ['Valais — Sion', 48, 35], ['Valais — Verbier', 48, 35], ['Valais — Crans-Montana', 48, 35]] as const
const languages = { FR: { greeting: 'Bonjour', subtitle: 'Votre devis régional, clair et immédiat.', availability: 'Disponibilité', region: 'Canton et destination', slot: 'Créneau préféré', assistant: 'Assistant H&S', ask: 'Votre question…', service: 'Prestation', billing: 'Informations de facturation', name: 'Raison sociale / Nom', address: 'Adresse', vat: 'IDE / TVA', estimate: 'ESTIMATION EN CHF', custom: 'Ménage sur mesure', tax: 'TVA suisse calculée automatiquement à 8.1%', extras: 'Extras', send: 'Envoyer', quote: 'Générer le devis / Facture', logout: 'Déconnexion', transport: 'Transport' }, ES: { greeting: 'Hola', subtitle: 'Su presupuesto regional, claro e inmediato.', availability: 'Disponibilidad', region: 'Cantón y destino', slot: 'Horario preferido', assistant: 'Asistente H&S', ask: 'Su pregunta…', service: 'Servicio', billing: 'Datos de facturación', name: 'Razón social / Nombre', address: 'Dirección', vat: 'IDE / IVA', estimate: 'ESTIMACIÓN EN CHF', custom: 'Limpieza a medida', tax: 'IVA suizo calculado automáticamente al 8.1%', extras: 'Extras', send: 'Enviar', quote: 'Generar presupuesto / Factura', logout: 'Cerrar sesión', transport: 'Transporte' }, EN: { greeting: 'Hello', subtitle: 'Your clear, immediate regional quote.', availability: 'Availability', region: 'Canton and destination', slot: 'Preferred time', assistant: 'H&S Assistant', ask: 'Your question…', service: 'Service', billing: 'Billing details', name: 'Company / Name', address: 'Address', vat: 'UID / VAT', estimate: 'ESTIMATE IN CHF', custom: 'Custom cleaning', tax: 'Swiss VAT calculated automatically at 8.1%', extras: 'Extras', send: 'Send', quote: 'Generate quote / Invoice', logout: 'Sign out', transport: 'Transport' } } as const

export default function ClientDashboard() {
  const { data: session } = authClient.useSession()
  const [language, setLanguage] = useState<keyof typeof languages>('FR')
  const [destination, setDestination] = useState<keyof typeof destinations>('commercial')
  const [service, setService] = useState(destinations.commercial.items[0][0])
  const [region, setRegion] = useState(regions[0][0])
  const [slot, setSlot] = useState('Matin · 08:00–12:00')
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [details, setDetails] = useState('')
  const [customer, setCustomer] = useState({ name: '', address: '', vat: '' })
  const [reservation, setReservation] = useState({ squareMeters: 80, date: '2026-10-02', slot: 'Matin · 08:00–12:00' })
  const [editingReservation, setEditingReservation] = useState(false)
  const [reservationSaved, setReservationSaved] = useState(false)
  const copy = languages[language]
  const name = session?.user?.name?.split(' ')[0] || 'Client'
  const total = useMemo(() => {
    const serviceMultiplier = destinations[destination].items.find(([label]) => label === service)?.[1] ?? destinations[destination].items[0][1]
    const selectedRegion = regions.find(([label]) => label === region) ?? regions[0]
    const hourlyRate = selectedRegion[1]
    const transport = selectedRegion[2]
    const serviceRate = serviceMultiplier
    const servicePrice = destination === 'vehicles' ? serviceRate : reservation.squareMeters * serviceRate
    const extrasTotal = selectedExtras.reduce((sum, key) => sum + (extras.find(([id]) => id === key)?.[2] ?? 0), 0)
    const subtotal = servicePrice + transport + extrasTotal
    return { subtotal, vat: subtotal * 0.081, total: subtotal * 1.081 }
  }, [destination, region, reservation.squareMeters, selectedExtras, service])
  const generateQuote = async () => {
    const iban = 'CH39 0026 2262 1458 9201 H'
    const qr = await QRCode.toDataURL(`SPC\n0200\n1\nS\n${iban}\nH&S Service Sàrl\nAv. du Simplon 9\n1225 Chêne-Bourg\nCH\n\n\nCHF\n${total.total.toFixed(2)}\nS\n${name}\n\n\nDevis hs-cleaning.ch`)
    const pdf = new jsPDF()
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20); pdf.text('H&S Service Sàrl', 20, 25)
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10)
    pdf.text('Av. du Simplon 9 · 1225 Chêne-Bourg', 20, 34)
    pdf.text('Assurance Baloise · couverture CHF 5’000’000', 20, 42)
    pdf.text(`Devis pour ${customer.name || name}`, 20, 58); pdf.text(`Adresse: ${customer.address || 'Non renseignée'}`, 20, 66); pdf.text(`IDE / TVA: ${customer.vat || 'Non renseigné'}`, 20, 74);     pdf.text(`${service} · ${region} · ${slot}`, 20, 82)
    pdf.text(`Détails: ${details || 'Non renseignés'}`, 20, 88)

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
    <header className="portal-header"><div className="portal-brand"><img src="/hs-logo.png" alt="H&S Quality Service" /><div><strong>H&amp;S Quality Service</strong><span>{copy.greeting}, {name}</span></div></div><div className="header-actions"><select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value as keyof typeof languages)}><option>FR</option><option>ES</option><option>EN</option></select><button className="login-icon" onClick={signOut} aria-label={copy.logout} title={copy.logout}><LogIn /></button></div></header>
    <div className="client-grid"><section className="panel calculator-panel"><div className="quote-code">HS2026</div><div className="panel-header"><div><p className="eyebrow">{copy.estimate}</p><h2>{copy.custom}</h2><p>{copy.tax}</p></div><strong className="calculator-total">CHF {total.total.toFixed(2)}</strong></div>
      <section className="writing-guide"><div className="guide-title"><Sparkles /> <strong>{language === 'ES' ? 'Guía de redacción profesional' : language === 'EN' ? 'Professional writing guide' : 'Guide de rédaction professionnelle'}</strong></div><p>{language === 'ES' ? 'Mantenimiento regular de comunidad de vecinos con [X] plantas en [Localidad]. Tareas: limpieza de pasillos, gestión de contenedores de basura y control de accesos.' : language === 'EN' ? 'Regular building maintenance with [X] floors in [Location]. Tasks: corridor cleaning, waste-bin management and access control.' : 'Entretien régulier d’immeuble avec [X] étages à [Localité]. Tâches : nettoyage des couloirs, gestion des poubelles et contrôle des accès.'}</p></section>
      <div className="destination-tabs">{Object.entries(destinations).map(([key, item]) => <button type="button" key={key} className={destination === key ? 'active' : ''} onClick={() => { const next = key as keyof typeof destinations; setDestination(next); setService(destinations[next].items[0][0]) }}>{item.label[language]}</button>)}</div>
      <label className="field"><span>{copy.service}</span><select value={service} onChange={(event) => setService(event.target.value)}>{destinations[destination].items.map(([label]) => <option key={label}>{label}</option>)}</select></label>
      {destination !== 'vehicles' && <label className="field"><span>Surface (m²)</span><input type="number" min="1" max="10000" value={reservation.squareMeters} onChange={(event) => setReservation({ ...reservation, squareMeters: Math.max(1, Number(event.target.value) || 1) })} /></label>}
      <div className="customer-fields" aria-label={copy.billing}><label className="field"><span>{copy.name}</span><input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder={name} /></label><label className="field"><span>{copy.address}</span><input value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder={language === 'FR' ? 'Rue, NPA, ville' : language === 'ES' ? 'Calle, código postal, ciudad' : 'Street, postal code, city'} /></label><label className="field"><span>{copy.vat}</span><input value={customer.vat} onChange={(event) => setCustomer({ ...customer, vat: event.target.value })} placeholder="CHE-123.456.789 TVA" /></label></div>
      <div className="extras-grid">{extras.map(([key, label, price]) => <label className="extra-option" key={key}><input type="checkbox" checked={selectedExtras.includes(key)} onChange={() => setSelectedExtras((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} /><span>{label[language]}</span><small>+ CHF {price}.00</small></label>)}</div>
      <div className="calculator-breakdown"><span>Sous-total HT <strong>CHF {total.subtotal.toFixed(2)}</strong></span><span>TVA 8.1% <strong>CHF {total.vat.toFixed(2)}</strong></span><span>Total TTC <strong>CHF {total.total.toFixed(2)}</strong></span></div><button className="primary-button" onClick={generateQuote}>{copy.quote}</button>
      <div className="specific-details"><label className="details-label" htmlFor="work-details">{language === 'ES' ? 'Detalles específicos del trabajo' : language === 'EN' ? 'Specific work details' : 'Détails spécifiques de l’intervention'}</label><textarea id="work-details" className="work-details" value={details} onChange={(event) => setDetails(event.target.value)} placeholder={language === 'ES' ? 'Describe el lugar, la frecuencia y las tareas...' : language === 'EN' ? 'Describe the location, frequency and tasks...' : 'Décrivez le lieu, la fréquence et les tâches...'} rows={7} /></div>
    </section><section className="panel reservation-panel"><div className="panel-header"><div><p className="eyebrow">Suivi de réservation</p><h2>Réservation HS-2026-0048</h2><p>{reservation.squareMeters} m² · {reservation.date} · {reservation.slot}</p></div><span className="status-badge">Confirmée</span></div>{editingReservation ? <div className="reservation-form"><label className="field"><span>Surface (m²)</span><input type="number" min="1" max="10000" value={reservation.squareMeters} onChange={(event) => setReservation({ ...reservation, squareMeters: Math.max(1, Number(event.target.value) || 1) })} /></label><label className="field"><span>Date souhaitée</span><input type="date" value={reservation.date} onChange={(event) => setReservation({ ...reservation, date: event.target.value })} /></label><label className="field"><span>Créneau</span><select value={reservation.slot} onChange={(event) => setReservation({ ...reservation, slot: event.target.value })}><option>Matin · 08:00–12:00</option><option>Après-midi · 13:00–17:00</option></select></label><div className="reservation-actions"><button className="primary-button" type="button" onClick={() => { setEditingReservation(false); setReservationSaved(true) }}>Enregistrer les modifications</button><button className="secondary-button" type="button" onClick={() => setEditingReservation(false)}>Annuler</button></div></div> : <div className="reservation-actions"><button className="secondary-button" type="button" onClick={() => { setReservationSaved(false); setEditingReservation(true) }}>Modifier la réservation</button>{reservationSaved && <span className="save-confirmation" role="status">Modifications enregistrées</span>}</div>}</section><section className="panel payment-panel"><div><p className="eyebrow">Paiement sécurisé</p><h2>Recevoir les paiements en CHF</h2><p>Préparation Stripe avec moyens de paiement dynamiques, dont TWINT lorsqu’il est disponible pour le client.</p></div><div className="payment-methods"><span>Stripe Checkout</span><span>TWINT</span><span>CHF</span></div><button className="secondary-button" type="button" disabled>Connexion du compte bancaire à finaliser</button></section><aside className="client-side"><section className="panel"><p className="eyebrow">{copy.availability}</p><h2>{copy.region}</h2><label className="field"><span>{copy.region}</span><select value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map(([label]) => <option key={label}>{label}</option>)}</select></label><label className="field"><span>{copy.slot}</span><select value={slot} onChange={(event) => setSlot(event.target.value)}><option>{language === 'FR' ? 'Matin' : language === 'ES' ? 'Mañana' : 'Morning'} · 08:00–12:00</option><option>{language === 'FR' ? 'Après-midi' : language === 'ES' ? 'Tarde' : 'Afternoon'} · 13:00–17:00</option></select></label></section><section className="panel assistant-panel"><p className="eyebrow">{copy.assistant}</p><h2>{language === 'FR' ? 'Une réponse, dans votre langue.' : language === 'ES' ? 'Una respuesta, en su idioma.' : 'An answer in your language.'}</h2><form onSubmit={askAssistant}><input aria-label={copy.ask} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={copy.ask} /><button className="primary-button" type="submit">Envoyer</button></form>{answer && <p className="assistant-answer">{answer}</p>}</section></aside></div><Link className="personnel-access" href="/admin/dashboard">Espace Personnel &amp; Administration</Link>
  </main>
}
