'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Globe2,
  ImagePlus,
  LockKeyhole,
  LogIn,
  Menu,
  Plus,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'

const translations = {
  FR: {
    eyebrow: 'PORTAIL CLIENT & OPÉRATIONS', title: 'La propreté, pensée pour vos équipes.', subtitle: 'Une plateforme simple et sûre pour piloter vos interventions, vos collaborateurs et vos factures.', login: 'Se connecter', signup: 'Créer un compte', individual: 'PARTICULIER', company: 'ENTREPRISE', email: 'Adresse e-mail', password: 'Mot de passe', access: 'Accéder à mon espace', name: 'Nom complet', phone: 'Téléphone', address: 'Adresse', legal: 'Raison sociale', vat: 'Numéro IDE / TVA suisse', create: 'Créer mon compte', back: 'Retour à la connexion', personnel: 'Gestion du Personnel', planning: 'Planning terrain', invoices: 'Factures QR & Devis', clients: 'Base de clients', policy: 'Politique de confidentialité nLPD', insurance: 'Assurance responsabilité civile Baloise · CHF 5’000’000', welcome: 'Bonjour, Sophie', overview: 'Votre espace opérationnel', add: 'Ajouter un collaborateur', week: 'Semaine du 14 au 20 septembre 2026', generate: 'Générer le PDF', download: 'Télécharger le devis', total: 'Total TTC', save: 'Enregistrer', cancel: 'Annuler', unique: 'Code unique', permit: 'Permis de séjour', photo: 'Photo du collaborateur', before: 'Photo Avant', after: 'Photo Après', quote: 'Nouveau devis', client: 'Client', amount: 'Montant HT', vatRate: 'TVA 8.1%', iban: 'IBAN bénéficiaire', status: 'Statut', active: 'Actif', scheduled: 'Planifié', paid: 'Payée', logout: 'Se déconnecter', menu: 'Menu', swiss: 'Conçu en Suisse', contract: 'Intervention récurrente', edit: 'Modifier', addPhoto: 'Ajouter une photo', coverage: 'Couverture professionnelle complète', policyText: 'Vos données sont traitées selon la Loi fédérale sur la protection des données (nLPD).', invoiceNo: 'Devis N° 2026-0048', due: 'Valable jusqu’au 30.09.2026', vatNotice: 'TVA suisse incluse', extrasTitle: 'Ménage sur mesure', extrasHint: 'Ajoutez les options souhaitées à votre demande', oven: 'Nettoyage du Four intérieur', fridge: 'Nettoyage du Réfrigérateur intérieur', windows: 'Vitres et Stores de fenêtre', ironing: 'Repassage professionnel', extrasTotal: 'Options', presenceAlert: 'Confirmez votre présence 24h avant l’intervention', inbox: 'Boîte de réception', notifications: 'Notifications',
  },
  ES: {
    eyebrow: 'PORTAL CLIENTE Y OPERACIONES', title: 'La limpieza, pensada para tus equipos.', subtitle: 'Una plataforma sencilla y segura para gestionar servicios, colaboradores y facturas.', login: 'Iniciar sesión', signup: 'Crear una cuenta', individual: 'PARTICULAR', company: 'EMPRESA', email: 'Correo electrónico', password: 'Contraseña', access: 'Acceder a mi espacio', name: 'Nombre completo', phone: 'Teléfono', address: 'Dirección', legal: 'Razón social', vat: 'Número IDE / IVA suizo', create: 'Crear mi cuenta', back: 'Volver al acceso', personnel: 'Gestión del personal', planning: 'Planificación de campo', invoices: 'Facturas QR y presupuestos', clients: 'Base de clientes', policy: 'Política de privacidad nLPD', insurance: 'Seguro de responsabilidad Baloise · CHF 5.000.000', welcome: 'Hola, Sophie', overview: 'Tu espacio operativo', add: 'Añadir colaborador', week: 'Semana del 14 al 20 de septiembre de 2026', generate: 'Generar PDF', download: 'Descargar presupuesto', total: 'Total IVA incluido', save: 'Guardar', cancel: 'Cancelar', unique: 'Código único', permit: 'Permiso de residencia', photo: 'Foto del colaborador', before: 'Foto Antes', after: 'Foto Después', quote: 'Nuevo presupuesto', client: 'Cliente', amount: 'Importe sin IVA', vatRate: 'IVA 8,1%', iban: 'IBAN beneficiario', status: 'Estado', active: 'Activo', scheduled: 'Planificado', paid: 'Pagada', logout: 'Cerrar sesión', menu: 'Menú', swiss: 'Diseñado en Suiza', contract: 'Servicio recurrente', edit: 'Editar', addPhoto: 'Añadir foto', coverage: 'Cobertura profesional completa', policyText: 'Tus datos se tratan según la Ley federal suiza de protección de datos (nLPD).', invoiceNo: 'Presupuesto N.º 2026-0048', due: 'Válido hasta 30.09.2026', vatNotice: 'IVA suizo incluido', extrasTitle: 'Limpieza a medida', extrasHint: 'Añade las opciones que necesitas a tu solicitud', oven: 'Limpieza interior del horno', fridge: 'Limpieza interior del frigorífico', windows: 'Cristales y persianas', ironing: 'Planchado profesional', extrasTotal: 'Extras', presenceAlert: 'Confirma tu presencia 24 h antes de la intervención', inbox: 'Bandeja de entrada', notifications: 'Notificaciones',
  },
  EN: {
    eyebrow: 'CLIENT & OPERATIONS PORTAL', title: 'Cleanliness, designed for your teams.', subtitle: 'A simple, secure platform to manage services, people and invoices.', login: 'Sign in', signup: 'Create an account', individual: 'INDIVIDUAL', company: 'COMPANY', email: 'Email address', password: 'Password', access: 'Access my workspace', name: 'Full name', phone: 'Phone', address: 'Address', legal: 'Legal company name', vat: 'Swiss UID / VAT number', create: 'Create my account', back: 'Back to sign in', personnel: 'People management', planning: 'Field planning', invoices: 'QR invoices & quotes', clients: 'Client directory', policy: 'Swiss nFADP privacy policy', insurance: 'Baloise liability insurance · CHF 5,000,000', welcome: 'Hello, Sophie', overview: 'Your operations workspace', add: 'Add collaborator', week: 'Week of September 14–20, 2026', generate: 'Generate PDF', download: 'Download quote', total: 'Total incl. VAT', save: 'Save', cancel: 'Cancel', unique: 'Unique code', permit: 'Residence permit', photo: 'Collaborator photo', before: 'Before photo', after: 'After photo', quote: 'New quote', client: 'Client', amount: 'Net amount', vatRate: 'VAT 8.1%', iban: 'Beneficiary IBAN', status: 'Status', active: 'Active', scheduled: 'Scheduled', paid: 'Paid', logout: 'Sign out', menu: 'Menu', swiss: 'Designed in Switzerland', contract: 'Recurring service', edit: 'Edit', addPhoto: 'Add photo', coverage: 'Full professional coverage', policyText: 'Your data is processed under the Swiss Federal Act on Data Protection (nFADP).', invoiceNo: 'Quote No. 2026-0048', due: 'Valid until 30.09.2026', vatNotice: 'Swiss VAT included', extrasTitle: 'Tailored cleaning', extrasHint: 'Add the options you need to your request', oven: 'Inside oven cleaning', fridge: 'Inside refrigerator cleaning', windows: 'Windows and shutters', ironing: 'Professional ironing', extrasTotal: 'Extras', presenceAlert: 'Confirm your attendance 24 hours before the service', inbox: 'Inbox', notifications: 'Notifications',
  },
} as const

type Language = keyof typeof translations
type Mode = 'login' | 'signup'
type Tab = 'personnel' | 'planning' | 'invoices' | 'clients'

const staff = [
  { name: 'Nicolas Berset', role: 'Chef d’équipe', permit: 'Permis C', code: '482 091', initials: 'NB' },
  { name: 'Amina El Idrissi', role: 'Collaboratrice', permit: 'Permis B', code: '719 204', initials: 'AE' },
  { name: 'Marco Rossi', role: 'Collaborateur', permit: 'Permis G', code: '306 887', initials: 'MR' },
]

function Field({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return <label className="field"><span>{label}</span><input type={type} placeholder={placeholder} /></label>
}

export default function HSCleaningApp() {
  const [language, setLanguage] = useState<Language>('FR')
  const [mode, setMode] = useState<Mode>('login')
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual')
  const [authenticated, setAuthenticated] = useState(false)
  const [tab, setTab] = useState<Tab>('personnel')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const t = translations[language]

  const generatePdf = async () => {
    const iban = 'CH39 0026 2262 1458 9201 H'
    const qrPayload = `SPC\\n0200\\n1\\nS\\n${iban}\\nH&S Service Sàrl\\nAv. du Simplon 9\\n1225 Chêne-Bourg\\nCH\\n\\n\\nCHF\\n1999.85\\nS\\nFondation Arc-en-Ciel\\nRue de Lausanne 46\\n1201 Genève\\n\\nDevis 2026-0048`
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 260, errorCorrectionLevel: 'M' })
    const pdf = new jsPDF()
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.text('H&S Service Sàrl', 20, 25)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.text('Av. du Simplon 9 · 1225 Chêne-Bourg · CHE-259.228.541', 20, 34)
    pdf.text('RC Baloise Assurances · couverture CHF 5’000’000', 20, 42)
    pdf.setFontSize(11)
    pdf.text(t.invoiceNo, 20, 54)
    pdf.text('hs-cleaning.ch', 20, 62)
    pdf.line(20, 69, 190, 69)
    pdf.setFontSize(12)
    pdf.text(`${t.client}: Fondation Arc-en-Ciel`, 20, 86)
    pdf.text(`${t.amount}: CHF 1’850.00`, 20, 98)
    pdf.text(`${t.vatRate}: CHF 149.85`, 20, 110)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${t.total}: CHF 1’999.85`, 20, 126)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${t.iban}: ${iban}`, 20, 140)
    pdf.text(t.vatNotice, 20, 150)
    pdf.addImage(qrDataUrl, 'PNG', 20, 162, 46, 46)
    pdf.setFontSize(9)
    pdf.text('Paiement QR suisse · H&S Service Sàrl', 72, 174)
    pdf.text('Baloise Assurances · RC CHF 5’000’000', 72, 183)
    pdf.save('hs-cleaning-facture-qr-2026-0048.pdf')
  }

  if (!authenticated) return <Landing t={t} language={language} setLanguage={setLanguage} mode={mode} setMode={setMode} accountType={accountType} setAccountType={setAccountType} onAccess={() => setAuthenticated(true)} />

  return <Dashboard t={t} language={language} setLanguage={setLanguage} tab={tab} setTab={setTab} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={() => setAuthenticated(false)} onGeneratePdf={generatePdf} selectedExtras={selectedExtras} setSelectedExtras={setSelectedExtras} />
}

function LanguageSwitcher({ language, setLanguage }: { language: Language; setLanguage: (language: Language) => void }) {
  return <div className="language-switcher" aria-label="Language selector">{(['FR', 'ES', 'EN'] as Language[]).map((item) => <button key={item} className={language === item ? 'selected' : ''} onClick={() => setLanguage(item)}>{item}</button>)}</div>
}

function Brand() { return <div className="brand"><img className="brand-logo" src="/hs-logo.png" alt="H&S Service Quality Service" /><span className="brand-name">QUALITY<br /><strong>SERVICE</strong></span></div> }

function Landing({ t, language, setLanguage, mode, setMode, accountType, setAccountType, onAccess }: { t: (typeof translations)[Language]; language: Language; setLanguage: (language: Language) => void; mode: Mode; setMode: (mode: Mode) => void; accountType: 'individual' | 'company'; setAccountType: (type: 'individual' | 'company') => void; onAccess: () => void }) {
  return <main className="landing"><section className="landing-visual"><div className="visual-top"><Brand /><LanguageSwitcher language={language} setLanguage={setLanguage} /></div><div className="visual-copy"><p className="eyebrow light">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.subtitle}</p><div className="trust-row"><span><ShieldCheck /> {t.coverage}</span><span><LockKeyhole /> {t.swiss}</span></div></div><div className="visual-footer"><span>Genève · Vaud · Fribourg</span><span>© 2026 H&S Quality Service</span></div></section><section className="auth-panel"><div className="auth-inner"><div className="mobile-brand"><Brand /><LanguageSwitcher language={language} setLanguage={setLanguage} /></div><div className="auth-heading"><p className="eyebrow">{mode === 'login' ? 'ESPACE SÉCURISÉ' : 'BIENVENUE CHEZ H&S'}</p><h2>{mode === 'login' ? t.login : t.signup}</h2><p>{mode === 'login' ? 'Gérez vos opérations en toute simplicité.' : 'Créez votre accès professionnel en quelques étapes.'}</p></div>{mode === 'signup' && <div className="account-toggle"><button className={accountType === 'individual' ? 'active' : ''} onClick={() => setAccountType('individual')}><UserRound />{t.individual}</button><button className={accountType === 'company' ? 'active' : ''} onClick={() => setAccountType('company')}><Building2 />{t.company}</button></div>}<form onSubmit={(event) => { event.preventDefault(); onAccess() }} className="auth-form">{mode === 'signup' && <>{accountType === 'individual' ? <><Field label={t.name} placeholder="Sophie Martin" /><Field label={t.phone} placeholder="+41 79 000 00 00" /><Field label={t.address} placeholder="Rue du Centre 12, 1225 Chêne-Bourg" /></> : <><Field label={t.legal} placeholder="H&S Quality Service Sàrl" /><Field label={t.vat} placeholder="CHE-123.456.789 TVA" /></>}</>}<Field label={t.email} placeholder="sophie@exemple.ch" type="email" /><Field label={t.password} placeholder="••••••••••••" type="password" /><button className="primary-button" type="submit">{mode === 'login' ? <><LogIn />{t.access}</> : <><Check />{t.create}</>}<ArrowRight /></button></form><button className="mode-switch" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? <>{t.signup} <ArrowRight /></> : <>{t.back} <ArrowRight /></>}</button><p className="auth-legal">{t.policyText} <a href="https://www.fedlex.admin.ch/eli/cc/2022/491/fr" target="_blank" rel="noreferrer">{t.policy}</a></p></div></section></main>
}

function Dashboard({ t, language, setLanguage, tab, setTab, mobileOpen, setMobileOpen, onLogout, onGeneratePdf, selectedExtras, setSelectedExtras }: { t: (typeof translations)[Language]; language: Language; setLanguage: (language: Language) => void; tab: Tab; setTab: (tab: Tab) => void; mobileOpen: boolean; setMobileOpen: (open: boolean) => void; onLogout: () => void; onGeneratePdf: () => void; selectedExtras: string[]; setSelectedExtras: (extras: string[]) => void }) {
  const nav = [{ id: 'personnel' as Tab, label: t.personnel, icon: UsersRound }, { id: 'planning' as Tab, label: t.planning, icon: CalendarDays }, { id: 'invoices' as Tab, label: t.invoices, icon: FileText }, { id: 'clients' as Tab, label: t.clients, icon: Building2 }]
  return <main className="app-shell"><aside className={mobileOpen ? 'sidebar open' : 'sidebar'}><div className="sidebar-header"><Brand /><button className="close-mobile" onClick={() => setMobileOpen(false)}><X /></button></div><div className="workspace-label">H&S SERVICE SÀRL<br /><span>ESPACE ADMINISTRATEUR</span></div><nav>{nav.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'nav-item active' : 'nav-item'} onClick={() => { setTab(id); setMobileOpen(false) }}><Icon />{label}<ChevronDown /></button>)}</nav><div className="sidebar-bottom"><a href="https://www.fedlex.admin.ch/eli/cc/2022/491/fr" target="_blank" rel="noreferrer"><ShieldCheck />{t.policy}</a><button onClick={onLogout}><LogIn />{t.logout}</button></div></aside><section className="dashboard-main"><header className="dashboard-header"><button className="menu-button" onClick={() => setMobileOpen(true)}><Menu /></button><div><p className="eyebrow">H&S QUALITY SERVICE / ADMIN</p><h1>{t.welcome}</h1></div><div className="header-actions"><LanguageSwitcher language={language} setLanguage={setLanguage} /><div className="avatar">SM</div></div></header><div className="dashboard-content"><ExtrasChecklist t={t} selectedExtras={selectedExtras} setSelectedExtras={setSelectedExtras} /><div className="content-heading"><div><p className="eyebrow">{t.overview}</p><h2>{nav.find((item) => item.id === tab)?.label}</h2></div>{tab === 'personnel' && <button className="primary-button compact"><Plus />{t.add}</button>}{tab === 'invoices' && <button className="primary-button compact" onClick={onGeneratePdf}><FileText />{t.generate}</button>}</div>{tab === 'personnel' && <Personnel t={t} />}{tab === 'planning' && <Planning t={t} />}{tab === 'invoices' && <Invoices t={t} onGeneratePdf={onGeneratePdf} />}{tab === 'clients' && <CustomerBase t={t} />}</div></section></main>
}

const EXTRA_PRICES: Record<string, number> = { oven: 45, fridge: 35, windows: 55, ironing: 40 }

function ExtrasChecklist({ t, selectedExtras, setSelectedExtras }: { t: (typeof translations)[Language]; selectedExtras: string[]; setSelectedExtras: (extras: string[]) => void }) {
  const options = [{ id: 'oven', label: t.oven }, { id: 'fridge', label: t.fridge }, { id: 'windows', label: t.windows }, { id: 'ironing', label: t.ironing }]
  const extrasTotal = selectedExtras.reduce((sum, id) => sum + EXTRA_PRICES[id], 0)
  const toggle = (id: string) => setSelectedExtras(selectedExtras.includes(id) ? selectedExtras.filter((item) => item !== id) : [...selectedExtras, id])
  return <section className="panel extras-panel"><div className="panel-header"><div><h3>{t.extrasTitle}</h3><p>{t.extrasHint}</p></div><strong className="extras-price">CHF {extrasTotal.toFixed(2)}</strong></div><div className="extras-grid">{options.map((option) => <label className="extra-option" key={option.id}><input type="checkbox" checked={selectedExtras.includes(option.id)} onChange={() => toggle(option.id)} /><span>{option.label}</span><small>+ CHF {EXTRA_PRICES[option.id].toFixed(2)}</small></label>)}</div><div className="extras-summary"><span>{t.extrasTotal}</span><strong>CHF {extrasTotal.toFixed(2)} · {t.vatRate}</strong></div></section> }

function CustomerBase({ t }: { t: (typeof translations)[Language] }) {
  const clients = [
    { name: 'Alpine Offices', type: 'Entreprise · CHE-118.452.910', image: '/hs-logo.png', initials: 'AO' },
    { name: 'Léman Résidences', type: 'Entreprise · CHE-214.806.337', image: '/hs-logo.png', initials: 'LR' },
  ]
  return <section className="panel clients-panel"><div className="panel-header"><div><h3>{t.clients}</h3><p>Profils clients et logos enregistrés</p></div><button className="primary-button compact"><Plus />{t.add}</button></div><div className="client-grid">{clients.map((client) => <article className="client-card" key={client.name}><div className="client-image"><img src={client.image} alt={`Logo ${client.name}`} /></div><div className="client-details"><span className="eyebrow">{client.type}</span><h4>{client.name}</h4><p>Client actif · Genève</p><button className="text-button">{t.edit} <ArrowRight /></button></div></article>)}</div></section>
}

function Personnel({ t }: { t: (typeof translations)[Language] }) { return <div className="personnel-layout"><div className="stat-grid"><div className="stat-card"><span>{t.active}</span><strong>24</strong><small>+3 ce mois</small></div><div className="stat-card"><span>Permis B / C</span><strong>19</strong><small>Documents à jour</small></div><div className="stat-card"><span>Permis G</span><strong>5</strong><small>Frontaliers actifs</small></div></div><section className="panel staff-panel"><div className="panel-header"><div><h3>Collaborateurs actifs</h3><p>Répertoire sécurisé de votre équipe terrain</p></div><button className="text-button">Voir tout <ArrowRight /></button></div><div className="staff-list">{staff.map((person) => <div className="staff-row" key={person.code}><div className="person-avatar">{person.initials}</div><div className="person-info"><strong>{person.name}</strong><span>{person.role}</span></div><span className="permit-badge">{person.permit}</span><span className="unique-code">{t.unique} <strong>{person.code}</strong></span><button className="icon-button" aria-label={t.edit}>…</button></div>)}</div></section><section className="panel add-staff"><div className="upload-tile"><ImagePlus /><span>{t.photo}</span><small>JPG, PNG · max. 5 MB</small></div><div className="add-form"><div className="panel-header"><div><h3>Nouvelle fiche collaborateur</h3><p>Chaque profil reçoit un code unique à 6 chiffres.</p></div></div><div className="form-grid"><Field label={t.name} placeholder="Nom et prénom" /><Field label={t.permit} placeholder="Sélectionner" /></div><button className="primary-button compact"><Check />{t.save}</button></div></section></div> }

function Planning({ t }: { t: (typeof translations)[Language] }) { const days = ['LUN 14', 'MAR 15', 'MER 16', 'JEU 17', 'VEN 18', 'SAM 19']; return <div className="planning-layout"><div className="planning-toolbar"><div><strong>{t.week}</strong><span>12 interventions · 8 terminées</span></div><div className="toolbar-actions"><button className="secondary-button">Aujourd’hui</button><button className="primary-button compact"><Plus />Nouvelle intervention</button></div></div><section className="panel calendar"><div className="calendar-head"><span>Intervention</span>{days.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-row"><div className="job-label"><strong>Résidence du Parc</strong><span>Chêne-Bourg · 06:30</span></div>{days.map((day, index) => <div key={day} className={index === 1 ? 'day-cell filled' : 'day-cell'}>{index === 1 && <><span className="job-dot blue" /><strong>06:30</strong><small>Clock-in</small></>}{index === 3 && <span className="job-dot muted" />}</div>)}</div><div className="calendar-row"><div className="job-label"><strong>Bureau Altitude</strong><span>Carouge · 08:00</span></div>{days.map((day, index) => <div key={day} className={index === 2 ? 'day-cell filled green' : 'day-cell'}>{index === 2 && <><span className="job-dot green" /><strong>08:00</strong><small>Clock-in</small></>}{index === 4 && <span className="job-dot muted" />}</div>)}</div><div className="calendar-row"><div className="job-label"><strong>Villa Les Cèdres</strong><span>Cologny · 13:30</span></div>{days.map((day, index) => <div key={day} className={index === 4 ? 'day-cell filled orange' : 'day-cell'}>{index === 4 && <><span className="job-dot orange" /><strong>13:30</strong><small>Clock-in</small></>}{index === 5 && <span className="job-dot muted" />}</div>)}</div></section><section className="panel field-proof"><div className="panel-header"><div><h3>Preuves terrain</h3><p>Dernières photos Avant / Après · synchronisées aujourd’hui</p></div><button className="text-button">Voir la galerie <ArrowRight /></button></div><div className="proof-grid">{['Résidence du Parc', 'Bureau Altitude', 'Villa Les Cèdres'].map((name, index) => <div className="proof-card" key={name}><div className={`proof-image proof-${index + 1}`}><span>{index === 0 ? 'AVANT' : 'APRÈS'}</span></div><strong>{name}</strong><small>18.09.2026 · {index + 6}:3{index}</small></div>)}</div></section></div> }

function Invoices({ t, onGeneratePdf }: { t: (typeof translations)[Language]; onGeneratePdf: () => void }) { return <div className="invoices-layout"><div className="invoice-stats"><div className="stat-card"><span>Devis envoyés</span><strong>18</strong><small>CHF 24’850 HT</small></div><div className="stat-card"><span>Factures payées</span><strong>CHF 12’480</strong><small className="positive">+18.2% ce mois</small></div><div className="stat-card"><span>En attente</span><strong>CHF 4’260</strong><small>3 factures</small></div></div><div className="invoice-columns"><section className="panel invoice-preview"><div className="invoice-paper"><div className="invoice-brand"><Brand /><span>{t.invoiceNo}</span></div><div className="invoice-client"><div><small>{t.client}</small><strong>Fondation Arc-en-Ciel</strong><span>Rue de Lausanne 46<br />1201 Genève</span></div><div><small>{t.due}</small><strong>30.09.2026</strong><span>{t.contract}</span></div></div><div className="invoice-line"><span>Prestations de nettoyage professionnel</span><strong>CHF 1’850.00</strong></div><div className="invoice-line muted-line"><span>{t.vatRate}</span><strong>CHF 149.85</strong></div><div className="invoice-total"><span>{t.total}</span><strong>CHF 1’999.85</strong></div><div className="qr-payment"><div className="qr-code">▦</div><div><small>{t.iban}</small><strong>CH39 0026 2262 1458 9201 H</strong><span>H&S Service Sàrl<br />Av. du Simplon 9 · 1225 Chêne-Bourg<br />RC Baloise · CHF 5’000’000</span></div></div></div><button className="secondary-button full" onClick={onGeneratePdf}><FileText />{t.download}</button></section><section className="panel quote-form"><div className="panel-header"><div><h3>{t.quote}</h3><p>Créez un document prêt à envoyer.</p></div></div><Field label={t.client} placeholder="Nom du client ou de l’entreprise" /><div className="form-grid"><Field label={t.amount} placeholder="1’850.00" /><Field label={t.vatRate} placeholder="8.1 %" /></div><label className="field"><span>{t.iban}</span><input value="CH93 0076 2011 6238 5295 7" readOnly /></label><div className="secure-note"><ShieldCheck />{t.vatNotice} · IBAN vérifié</div><button className="primary-button full" onClick={onGeneratePdf}><FileText />{t.generate}</button></section></div></div> }
