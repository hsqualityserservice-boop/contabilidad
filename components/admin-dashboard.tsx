'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, Camera, CheckCircle2, ChevronDown, Clock3, FileText, Globe2, Mail, MapPin, Plus, Search, ShieldCheck, UserRound, Users, X } from 'lucide-react'
import { globalCopy, languageNames, languages, type Lang } from '@/lib/i18n'

type AdminTab = 'staff' | 'planning' | 'clients'

type AdminCopy = {
  title: string
  subtitle: string
  staff: string
  planning: string
  clients: string
  search: string
  invite: string
  employee: string
  email: string
  permission: string
  photo: string
  accessCode: string
  status: string
  active: string
  pending: string
  assign: string
  week: string
  clock: string
  evidence: string
  incidents: string
  beforeAfter: string
  client: string
  company: string
  address: string
  taxId: string
  quote: string
  invoice: string
  vat: string
  download: string
  addClient: string
  updated: string
  secure: string
  all: string
}

const copy: Record<Lang, AdminCopy> = {
  FR: { title: 'Administration', subtitle: 'Pilotez votre équipe, vos interventions et vos clients depuis un espace unique.', staff: 'Gestion du personnel', planning: 'Planning terrain & calendrier', clients: 'Espace clients & devis', search: 'Rechercher', invite: 'Ajouter un collaborateur', employee: 'Collaborateur', email: 'E-mail professionnel', permission: 'Permissions', photo: 'Photo de profil', accessCode: 'Code d’accès unique', status: 'Statut', active: 'Actif', pending: 'En attente', assign: 'Affecter un service', week: 'Semaine du 21 au 27 septembre', clock: 'Pointages Clock-In / Out', evidence: 'Photos avant / après', incidents: 'Alertes incidents', beforeAfter: 'Preuves terrain', client: 'Client', company: 'Entreprise', address: 'Adresse', taxId: 'IDE / TVA', quote: 'Demande de devis', invoice: 'Facturer avec TVA', vat: 'TVA 8,1 %', download: 'Télécharger la facture QR', addClient: 'Nouveau client', updated: 'Mis à jour à l’instant', secure: 'Accès administrateur sécurisé', all: 'Tout afficher' },
  ES: { title: 'Administración', subtitle: 'Gestiona tu equipo, tus servicios y tus clientes desde un único espacio.', staff: 'Gestión del personal', planning: 'Planning de campo y calendario', clients: 'Espacio clientes y presupuestos', search: 'Buscar', invite: 'Añadir colaborador', employee: 'Colaborador', email: 'Email profesional', permission: 'Permisos', photo: 'Foto de perfil', accessCode: 'Código de acceso único', status: 'Estado', active: 'Activo', pending: 'Pendiente', assign: 'Asignar servicio', week: 'Semana del 21 al 27 de septiembre', clock: 'Fichajes Clock-In / Out', evidence: 'Fotos antes / después', incidents: 'Alertas de incidencias', beforeAfter: 'Pruebas del terreno', client: 'Cliente', company: 'Empresa', address: 'Dirección', taxId: 'IDE / IVA', quote: 'Solicitud de presupuesto', invoice: 'Facturar con IVA', vat: 'IVA 8,1 %', download: 'Descargar factura QR', addClient: 'Nuevo cliente', updated: 'Actualizado ahora', secure: 'Acceso de administrador seguro', all: 'Ver todo' },
  EN: { title: 'Administration', subtitle: 'Manage your team, field operations and clients from one secure workspace.', staff: 'Staff management', planning: 'Field planning & calendar', clients: 'Client space & quotes', search: 'Search', invite: 'Add collaborator', employee: 'Collaborator', email: 'Work email', permission: 'Permissions', photo: 'Profile photo', accessCode: 'Unique access code', status: 'Status', active: 'Active', pending: 'Pending', assign: 'Assign service', week: 'Week of September 21–27', clock: 'Clock-In / Out records', evidence: 'Before / after photos', incidents: 'Incident alerts', beforeAfter: 'Field evidence', client: 'Client', company: 'Company', address: 'Address', taxId: 'UID / VAT', quote: 'Quote request', invoice: 'Invoice with VAT', vat: 'VAT 8.1%', download: 'Download QR invoice', addClient: 'New client', updated: 'Updated just now', secure: 'Secure administrator access', all: 'View all' },
}

const staff = [
  { name: 'Sofia Martin', role: 'Responsable terrain', email: 'sofia.martin@hs-cleaning.ch', permission: 'G', code: 'HS-7K4P-21', status: 'active', initials: 'SM' },
  { name: 'Luca Bernasconi', role: 'Collaborateur', email: 'luca.b@hs-cleaning.ch', permission: 'B', code: 'HS-3N8Q-64', status: 'active', initials: 'LB' },
  { name: 'Amélie Rochat', role: 'Collaboratrice', email: 'amelie.r@hs-cleaning.ch', permission: 'C', code: 'HS-9D2M-18', status: 'pending', initials: 'AR' },
]

const services = [
  { day: 'Lun 21', city: 'Genève', service: 'Nettoyage bureaux', employee: 'Sofia Martin', time: '08:00 – 11:30', state: 'Confirmé' },
  { day: 'Mar 22', city: 'Lausanne', service: 'État des lieux', employee: 'Luca Bernasconi', time: '13:30 – 16:00', state: 'Confirmé' },
  { day: 'Jeu 24', city: 'Nyon', service: 'Nettoyage après travaux', employee: 'Amélie Rochat', time: '09:00 – 14:00', state: 'À confirmer' },
]

const clients = [
  { company: 'Alpine Offices SA', address: 'Rue du Rhône 14, Genève', taxId: 'CHE-112.884.309 TVA', quote: 'CHF 2’480.00', state: 'À facturer' },
  { company: 'Léman Résidences', address: 'Avenue d’Ouchy 8, Lausanne', taxId: 'CHE-219.552.740 TVA', quote: 'CHF 1’180.00', state: 'Devis accepté' },
]

export default function AdminDashboard({ userName, userEmail }: { userName?: string | null; userEmail: string }) {
  const [lang, setLang] = useState<Lang>('FR')
  const [tab, setTab] = useState<AdminTab>('staff')
  const [langOpen, setLangOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const t = useMemo(() => copy[lang], [lang])
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2800) }
  const globalLabels = globalCopy[lang]
  const tabs = [{ id: 'staff' as const, label: globalLabels.staffManagement, icon: Users }, { id: 'planning' as const, label: globalLabels.fieldPlanning, icon: CalendarDays }, { id: 'clients' as const, label: globalLabels.qrInvoicesQuotes, icon: FileText }]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-orange-700 text-white shadow-lg shadow-orange-700/20"><ShieldCheck className="size-5" /></div><div><p className="text-sm font-bold tracking-tight">H&S Quality Service</p><p className="text-xs text-slate-500">{t.secure}</p></div></div>
          <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 md:flex"><Search className="size-4" /><span>{t.search}...</span></div><div className="relative"><button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold" onClick={() => setLangOpen(!langOpen)} aria-expanded={langOpen}><Globe2 className="size-4 text-orange-700" />{lang}<ChevronDown className="size-3.5 text-slate-400" /></button>{langOpen && <div className="absolute right-0 top-12 z-20 w-32 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">{languages.map((item) => <button key={item} onClick={() => { setLang(item); setLangOpen(false) }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 ${lang === item ? 'font-bold text-orange-700' : ''}`}>{item}<span className="text-xs text-slate-400">{languageNames[item]}</span></button>)}</div>}</div><div className="hidden border-l border-slate-200 pl-3 sm:block"><p className="text-sm font-semibold">{userName || 'Administrateur'}</p><p className="text-xs text-slate-500">{userEmail}</p></div><div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800">{(userName || 'A').slice(0, 1).toUpperCase()}</div></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">H&S ADMIN</p><h1 className="text-3xl font-bold tracking-tight">{t.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{t.subtitle}</p></div><nav className="mb-7 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row" aria-label="Administration"><div className="flex flex-1 flex-col gap-2 sm:flex-row">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${tab === id ? 'bg-orange-700 text-white shadow-md shadow-orange-700/15' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="size-4" />{label}</button>)}</div></nav>{tab === 'staff' && <StaffPanel t={t} notify={notify} />}{tab === 'planning' && <PlanningPanel t={t} notify={notify} />}{tab === 'clients' && <ClientsPanel t={t} notify={notify} />}</div>{notice && <div role="status" className="fixed bottom-5 right-5 z-30 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl"><CheckCircle2 className="size-4 text-emerald-400" />{notice}<button onClick={() => setNotice('')} aria-label="Close"><X className="size-4 text-slate-400" /></button></div>}</main>
  )
}

function StaffPanel({ t, notify }: { t: AdminCopy; notify: (message: string) => void }) { return <section aria-labelledby="staff-title"><PanelHeader title={t.staff} action={t.invite} onAction={() => notify(t.updated)} /><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden grid-cols-[1.4fr_1.3fr_.65fr_1fr_.8fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid"><span>{t.employee}</span><span>{t.email}</span><span>{t.permission}</span><span>{t.photo}</span><span>{t.status}</span></div>{staff.map((person) => <div key={person.email} className="grid gap-4 border-b border-slate-100 px-5 py-5 last:border-0 md:grid-cols-[1.4fr_1.3fr_.65fr_1fr_.8fr] md:items-center"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800">{person.initials}</div><div><p className="text-sm font-semibold">{person.name}</p><p className="text-xs text-slate-500">{person.role}</p></div></div><a className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-700" href={`mailto:${person.email}`}><Mail className="size-3.5" />{person.email}</a><div><span className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">{person.permission}</span><span className="ml-2 text-xs text-slate-500">{person.code}</span></div><button onClick={() => notify(t.updated)} className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-orange-700 hover:text-orange-700"><Camera className="size-3.5" />{t.photo}</button><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${person.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{person.status === 'active' ? t.active : t.pending}</span></div>)}</div></section> }

function PlanningPanel({ t, notify }: { t: AdminCopy; notify: (message: string) => void }) { return <section><PanelHeader title={t.planning} action={t.assign} onAction={() => notify(t.updated)} /><div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div><p className="text-sm font-semibold">{t.week}</p><p className="mt-1 text-xs text-slate-500">{t.updated}</p></div><div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><MapPin className="size-4 text-orange-700" /> Genève · Vaud</div></div><div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><p className="font-semibold">{t.assign}</p></div>{services.map((service) => <div key={service.day} className="flex flex-col gap-3 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><div className="min-w-12 text-xs font-bold uppercase text-orange-700">{service.day}</div><div><p className="text-sm font-semibold">{service.service}</p><p className="mt-1 text-xs text-slate-500">{service.city} · {service.employee}</p></div></div><div className="flex items-center gap-3 text-xs text-slate-500"><span><Clock3 className="mr-1 inline size-3.5" />{service.time}</span><span className="rounded-full bg-slate-100 px-2 py-1">{service.state}</span></div></div>)}</div><div className="flex flex-col gap-5"><InfoCard icon={<Clock3 />} title={t.clock} value="18 / 20" detail="90 % des pointages reçus" /><InfoCard icon={<Camera />} title={t.evidence} value="24 photos" detail={t.beforeAfter} /><InfoCard icon={<ShieldCheck />} title={t.incidents} value="2 à vérifier" detail="1 priorité haute" /></div></div></section> }

function ClientsPanel({ t, notify }: { t: AdminCopy; notify: (message: string) => void }) { return <section><PanelHeader title={t.clients} action={t.addClient} onAction={() => notify(t.updated)} /><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden grid-cols-[1.2fr_1.35fr_1.2fr_.9fr_1fr] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid"><span>{t.company}</span><span>{t.address}</span><span>{t.taxId}</span><span>{t.quote}</span><span>{t.invoice}</span></div>{clients.map((client) => <div key={client.company} className="grid gap-4 border-b border-slate-100 px-5 py-5 last:border-0 md:grid-cols-[1.2fr_1.35fr_1.2fr_.9fr_1fr] md:items-center"><div><p className="text-sm font-semibold">{client.company}</p><p className="mt-1 text-xs text-slate-500">{t.client}</p></div><p className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="size-3.5 text-slate-400" />{client.address}</p><p className="text-xs text-slate-500">{client.taxId}</p><div><p className="text-sm font-semibold">{client.quote}</p><span className="text-xs text-emerald-700">{t.vat}</span></div><button onClick={() => notify(t.download)} className="flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700"><FileText className="size-3.5" />{client.state === 'À facturer' ? t.invoice : t.download}</button></div>)}</div></section> }

function PanelHeader({ title, action, onAction }: { title: string; action: string; onAction: () => void }) { return <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-bold tracking-tight">{title}</h2><button onClick={onAction} className="flex w-fit items-center gap-2 rounded-xl bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-800"><Plus className="size-4" />{action}</button></div> }

function InfoCard({ icon, title, value, detail }: { icon: React.ReactNode; title: string; value: string; detail: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center gap-3 text-sm font-semibold"><span className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700">{icon}</span>{title}</div><p className="text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div> }

export { copy as adminCopy }
