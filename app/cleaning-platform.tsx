'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Home,
  Languages,
  Mail,
  Menu,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { QuoteEstimator } from '@/components/quote-estimator'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/components/language-provider'
import type { Locale } from '@/lib/i18n'
type Page = 'overview' | 'quotes' | 'inbox' | 'clients' | 'settings'

const formatCHF = (amount: number, locale: Locale) => new Intl.NumberFormat(`${locale}-CH`, { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(amount)

const translations = {
  es: {
    overview: 'Resumen', quotes: 'Presupuestos', inbox: 'Bandeja de entrada', clients: 'Clientes', settings: 'Ajustes',
    search: 'Buscar cualquier cosa…',     today: 'Hoy', greeting: 'Buenos días', subtitle: 'Aquí tienes el resumen de tu negocio.',
    newQuote: 'Nuevo presupuesto', revenue: 'Ingresos este mes', bookings: 'Servicios reservados', pending: 'Presupuestos pendientes', satisfaction: 'Satisfacción del cliente',
    vsLastMonth: 'vs. mes anterior', thisWeek: 'Esta semana', viewCalendar: 'Ver calendario', requests: 'Solicitudes recientes', allRequests: 'Ver todas',
    client: 'Cliente', service: 'Servicio', date: 'Fecha', amount: 'Importe', status: 'Estado', confirmed: 'Confirmado', waiting: 'Pendiente', sent: 'Enviado',
    estimateTitle: 'Calcula un presupuesto', estimateText: 'Obtén un precio orientativo en segundos.', startEstimate: 'Calcular ahora', nextJobs: 'Próximos servicios', seeSchedule: 'Ver agenda', inboxTitle: 'Mensajes recientes', reply: 'Responder',
    quotePage: 'Presupuestos', quoteDesc: 'Consulta estimaciones y precios asociados a solicitudes reales de servicio.', all: 'Todos', draft: 'Borrador', accepted: 'Aceptado',
    inboxDesc: 'La bandeja mostrará conversaciones cuando se conecte una fuente de mensajería.', clientsDesc: 'Clientes que han enviado solicitudes de servicio.', settingsDesc: 'Personaliza tu negocio y tus preferencias.',
    newClient: 'Añadir cliente', compose: 'Redactar correo', open: 'Abrir', create: 'Crear presupuesto', cancel: 'Cancelar',
    estimator: 'Asistente de presupuesto', estimatorHint: 'Completa los detalles para calcular un precio estimado.', property: 'Tipo de propiedad', apartment: 'Apartamento', house: 'Casa', office: 'Oficina', area: 'Superficie', bedrooms: 'Habitaciones', bathrooms: 'Baños', frequency: 'Frecuencia', oneTime: 'Una vez', weekly: 'Semanal', biweekly: 'Cada 2 semanas', monthly: 'Mensual', extras: 'Servicios adicionales', windows: 'Limpieza de ventanas', oven: 'Horno', fridge: 'Nevera', deep: 'Limpieza a fondo', estimated: 'Precio estimado', perVisit: 'por visita', disclaimer: 'Estimación orientativa. El precio final se confirma tras revisar el espacio.', clientName: 'Nombre del cliente', email: 'Correo electrónico', quoteReady: 'Presupuesto listo para enviar', sendEmail: 'Enviar por correo', emailSubject: 'Tu presupuesto de limpieza', emailGreeting: 'Hola', emailIntro: 'Aquí tienes tu presupuesto estimado', emailSignoff: 'Un saludo',
    allMessages: 'Todos los mensajes', noResults: 'No hay resultados', noMessages: 'Aún no hay mensajes conectados a la plataforma.', noRequests: 'Todavía no hay solicitudes registradas.', noScheduledJobs: 'No hay servicios futuros confirmados.', noClientsWithRequests: 'Los clientes aparecerán cuando recibamos una solicitud.', reviewingStatus: 'En revisión', completedStatus: 'Completada', cancelledStatus: 'Cancelada', totalRequestsMetric: 'Solicitudes totales', reviewRequestsMetric: 'Por revisar', upcomingMetric: 'Servicios futuros', completedMetric: 'Servicios completados', recordsCaption: 'Registros guardados', reviewCaption: 'Solicitudes recibidas o en revisión', upcomingCaption: 'Solicitudes con fecha confirmada', completedCaption: 'Servicios marcados como completados', clientRecordsCaption: 'Clientes con solicitudes de servicio', lastRequest: 'Última solicitud', inquiries: 'consultas', replyTo: 'Responder a', markRead: 'Marcar como leído',
    mainMenu: 'MENÚ PRINCIPAL', workspacePlan: 'Plan profesional', adminRole: 'Administradora', helpTitle: '¿Necesitas ayuda?', helpCopy: 'Estamos aquí para ti.', requestsCaption: 'Las últimas solicitudes de tus clientes', scheduleCaption: 'Tu agenda de los próximos días', quickCalc: 'CÁLCULO RÁPIDO', estimatorKicker: 'ESTIMACIÓN INTELIGENTE', estimateReassurance: 'Sin compromiso · Resultado inmediato', unreadMessagesCaption: 'Sin mensajes registrados', management: 'GESTIÓN', communication: 'COMUNICACIÓN', relationships: 'RELACIONES', settingsEyebrow: 'PREFERENCIAS', messageLabel: 'MENSAJE', languagePreference: 'Idioma de la plataforma', languagePreferenceCopy: 'Elige el idioma que prefieres para gestionar tu negocio.', emailNotifications: 'Notificaciones por correo', emailNotificationsCopy: 'Recibe avisos cuando un cliente solicite un servicio.', businessInfo: 'Datos de tu negocio', businessLocation: 'HS Cleaning · Suiza', editInfo: 'Editar información', 
    service1: 'Limpieza de hogar', service2: 'Limpieza a fondo', service3: 'Limpieza de oficina', service4: 'Fin de obra', serviceShop: 'Limpieza de tienda', serviceClinic: 'Limpieza de clínica', serviceEndOfTenancy: 'Fin de contrato', serviceAirbnb: 'Airbnb / alquiler vacacional', serviceConcierge: 'Conserjería', myAccount: 'Mi cuenta', accountHint: 'Accede o regístrate', signIn: 'Acceder', closeMenu: 'Cerrar menú', openMenu: 'Abrir menú', notifications: 'Notificaciones', businessMetrics: 'Métricas del negocio', reference: 'Referencia', emailLabel: 'Correo electrónico', servicesLabel: 'Solicitudes', revenueLabel: 'Ingresos', lastService: 'Último servicio',
  },
  fr: {
    overview: 'Vue d’ensemble', quotes: 'Devis', inbox: 'Messages', clients: 'Clients', settings: 'Paramètres',
    search: 'Rechercher…', today: 'Aujourd’hui', greeting: 'Bonjour', subtitle: 'Voici le résumé de votre activité.',
    newQuote: 'Nouveau devis', revenue: 'Revenus ce mois', bookings: 'Prestations réservées', pending: 'Devis en attente', satisfaction: 'Satisfaction client',
    vsLastMonth: 'vs. mois dernier', thisWeek: 'Cette semaine', viewCalendar: 'Voir le calendrier', requests: 'Demandes récentes', allRequests: 'Tout voir',
    client: 'Client', service: 'Service', date: 'Date', amount: 'Montant', status: 'Statut', confirmed: 'Confirmé', waiting: 'En attente', sent: 'Envoyé',
    estimateTitle: 'Estimer un devis', estimateText: 'Obtenez une estimation en quelques secondes.', startEstimate: 'Estimer maintenant', nextJobs: 'Prochaines prestations', seeSchedule: 'Voir le planning', inboxTitle: 'Messages récents', reply: 'Répondre',
    quotePage: 'Devis', quoteDesc: 'Consultez les estimations associées aux demandes réelles de prestations.', all: 'Tous', draft: 'Brouillon', accepted: 'Accepté',
    inboxDesc: 'Les conversations apparaîtront lorsqu’une source de messagerie sera connectée.', clientsDesc: 'Clients ayant envoyé une demande de prestation.', settingsDesc: 'Personnalisez votre activité et vos préférences.',
    newClient: 'Ajouter un client', compose: 'Nouveau message', open: 'Ouvrir', create: 'Créer un devis', cancel: 'Annuler',
    estimator: 'Assistant devis', estimatorHint: 'Renseignez les détails pour calculer une estimation.', property: 'Type de bien', apartment: 'Appartement', house: 'Maison', office: 'Bureau', area: 'Surface', bedrooms: 'Chambres', bathrooms: 'Salles de bain', frequency: 'Fréquence', oneTime: 'Ponctuelle', weekly: 'Hebdomadaire', biweekly: 'Toutes les 2 semaines', monthly: 'Mensuelle', extras: 'Services supplémentaires', windows: 'Vitres', oven: 'Four', fridge: 'Réfrigérateur', deep: 'Nettoyage en profondeur', estimated: 'Prix estimé', perVisit: 'par prestation', disclaimer: 'Estimation indicative. Le prix final sera confirmé après visite.', clientName: 'Nom du client', email: 'Adresse e-mail', quoteReady: 'Devis prêt à envoyer', sendEmail: 'Envoyer par e-mail', emailSubject: 'Votre devis de nettoyage', emailGreeting: 'Bonjour', emailIntro: 'Voici votre estimation', emailSignoff: 'Cordialement',
    allMessages: 'Tous les messages', noResults: 'Aucun résultat', noMessages: 'Aucun message n’est encore connecté à la plateforme.', noRequests: 'Aucune demande n’a encore été enregistrée.', noScheduledJobs: 'Aucune prestation future confirmée.', noClientsWithRequests: 'Les clients apparaîtront après leur première demande.', reviewingStatus: 'En cours de revue', completedStatus: 'Terminée', cancelledStatus: 'Annulée', totalRequestsMetric: 'Demandes totales', reviewRequestsMetric: 'À examiner', upcomingMetric: 'Prestations à venir', completedMetric: 'Prestations terminées', recordsCaption: 'Enregistrements sauvegardés', reviewCaption: 'Demandes reçues ou en cours de revue', upcomingCaption: 'Demandes avec date confirmée', completedCaption: 'Prestations marquées comme terminées', clientRecordsCaption: 'Clients avec une demande de service', lastRequest: 'Dernière demande', inquiries: 'demandes', replyTo: 'Répondre à', markRead: 'Marquer comme lu',
    mainMenu: 'MENU PRINCIPAL', workspacePlan: 'Formule professionnelle', adminRole: 'Administratrice', helpTitle: 'Besoin d’aide ?', helpCopy: 'Nous sommes là pour vous.', requestsCaption: 'Les dernières demandes de vos clients', scheduleCaption: 'Votre planning des prochains jours', quickCalc: 'ESTIMATION RAPIDE', estimatorKicker: 'ESTIMATION INTELLIGENTE', estimateReassurance: 'Sans engagement · Résultat immédiat', unreadMessagesCaption: 'Aucun message enregistré', management: 'GESTION', communication: 'COMMUNICATION', relationships: 'RELATIONS', settingsEyebrow: 'PRÉFÉRENCES', messageLabel: 'MESSAGE', languagePreference: 'Langue de la plateforme', languagePreferenceCopy: 'Choisissez votre langue pour gérer votre activité.', emailNotifications: 'Notifications par e-mail', emailNotificationsCopy: 'Soyez averti lorsqu’un client demande un service.', businessInfo: 'Informations sur l’entreprise', businessLocation: 'HS Cleaning · Suisse', editInfo: 'Modifier les informations', 
    service1: 'Ménage à domicile', service2: 'Nettoyage en profondeur', service3: 'Nettoyage de bureaux', service4: 'Fin de chantier', serviceShop: 'Nettoyage de boutique', serviceClinic: 'Nettoyage de clinique', serviceEndOfTenancy: 'Fin de bail', serviceAirbnb: 'Airbnb / location saisonnière', serviceConcierge: 'Conciergerie', myAccount: 'Mon compte', accountHint: 'Connectez-vous ou inscrivez-vous', signIn: 'Connexion', closeMenu: 'Fermer le menu', openMenu: 'Ouvrir le menu', notifications: 'Notifications', businessMetrics: 'Indicateurs de l’activité', reference: 'Référence', emailLabel: 'Adresse e-mail', servicesLabel: 'Demandes', revenueLabel: 'Revenus', lastService: 'Dernière prestation',
  },
  en: {
    overview: 'Overview', quotes: 'Quotes', inbox: 'Inbox', clients: 'Clients', settings: 'Settings',
    search: 'Search anything…', today: 'Today', greeting: 'Good morning', subtitle: 'Here’s what’s happening with your business.',
    newQuote: 'New quote', revenue: 'Revenue this month', bookings: 'Booked services', pending: 'Pending quotes', satisfaction: 'Client satisfaction',
    vsLastMonth: 'vs. last month', thisWeek: 'This week', viewCalendar: 'View calendar', requests: 'Recent requests', allRequests: 'View all',
    client: 'Client', service: 'Service', date: 'Date', amount: 'Amount', status: 'Status', confirmed: 'Confirmed', waiting: 'Pending', sent: 'Sent',
    estimateTitle: 'Estimate a quote', estimateText: 'Get a price estimate in seconds.', startEstimate: 'Estimate now', nextJobs: 'Upcoming services', seeSchedule: 'View schedule', inboxTitle: 'Recent messages', reply: 'Reply',
    quotePage: 'Quotes', quoteDesc: 'Review estimates associated with real service requests.', all: 'All', draft: 'Draft', accepted: 'Accepted',
    inboxDesc: 'Conversations will appear once a messaging source is connected.', clientsDesc: 'Clients who have submitted a service request.', settingsDesc: 'Customize your business and preferences.',
    newClient: 'Add client', compose: 'Compose email', open: 'Open', create: 'Create quote', cancel: 'Cancel',
    estimator: 'Quote assistant', estimatorHint: 'Add a few details to calculate an estimated price.', property: 'Property type', apartment: 'Apartment', house: 'House', office: 'Office', area: 'Area', bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', frequency: 'Frequency', oneTime: 'One-time', weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly', extras: 'Additional services', windows: 'Window cleaning', oven: 'Oven', fridge: 'Fridge', deep: 'Deep clean', estimated: 'Estimated price', perVisit: 'per visit', disclaimer: 'Indicative estimate. Final pricing is confirmed after reviewing the space.', clientName: 'Client name', email: 'Email address', quoteReady: 'Quote ready to send', sendEmail: 'Send by email', emailSubject: 'Your cleaning quote', emailGreeting: 'Hello', emailIntro: 'Here is your estimated quote', emailSignoff: 'Best regards',
    allMessages: 'All messages', noResults: 'No results found', noMessages: 'No messages are connected to the platform yet.', noRequests: 'No service requests have been recorded yet.', noScheduledJobs: 'There are no confirmed future services.', noClientsWithRequests: 'Clients will appear here after their first service request.', reviewingStatus: 'Under review', completedStatus: 'Completed', cancelledStatus: 'Cancelled', totalRequestsMetric: 'Total requests', reviewRequestsMetric: 'To review', upcomingMetric: 'Upcoming services', completedMetric: 'Completed services', recordsCaption: 'Saved records', reviewCaption: 'Requests received or under review', upcomingCaption: 'Requests with a confirmed date', completedCaption: 'Services marked as completed', clientRecordsCaption: 'Clients with service requests', lastRequest: 'Last request', inquiries: 'inquiries', replyTo: 'Reply to', markRead: 'Mark as read',
    mainMenu: 'MAIN MENU', workspacePlan: 'Professional plan', adminRole: 'Administrator', helpTitle: 'Need help?', helpCopy: 'We’re here for you.', requestsCaption: 'Your clients’ latest requests', scheduleCaption: 'Your upcoming schedule', quickCalc: 'QUICK ESTIMATE', estimatorKicker: 'SMART ESTIMATE', estimateReassurance: 'No commitment · Instant estimate', unreadMessagesCaption: 'No messages recorded', management: 'MANAGEMENT', communication: 'COMMUNICATION', relationships: 'RELATIONSHIPS', settingsEyebrow: 'PREFERENCES', messageLabel: 'MESSAGE', languagePreference: 'Platform language', languagePreferenceCopy: 'Choose the language you prefer to manage your business.', emailNotifications: 'Email notifications', emailNotificationsCopy: 'Get notified when a client requests a service.', businessInfo: 'Business details', businessLocation: 'HS Cleaning · Switzerland', editInfo: 'Edit business details', 
    service1: 'Home cleaning', service2: 'Deep cleaning', service3: 'Office cleaning', service4: 'End of tenancy', serviceShop: 'Shop cleaning', serviceClinic: 'Clinic cleaning', serviceEndOfTenancy: 'End of tenancy', serviceAirbnb: 'Airbnb / holiday rental', serviceConcierge: 'Property management', myAccount: 'My account', accountHint: 'Sign in or create an account', signIn: 'Sign in', closeMenu: 'Close menu', openMenu: 'Open menu', notifications: 'Notifications', businessMetrics: 'Business metrics', reference: 'Reference', emailLabel: 'Email address', servicesLabel: 'Requests', revenueLabel: 'Revenue', lastService: 'Last service',
  },
}

type OperationRequest = {
  id: string
  userId: string
  name: string
  email: string
  serviceType: 'prive_regular' | 'fin_de_bail' | 'fin_travaux' | 'bureaux' | 'cabinet_medical' | 'conciergerie' | 'airbnb'
  status: 'requested' | 'reviewing' | 'confirmed' | 'completed' | 'cancelled'
  estimatedPrice: number
  confirmedPrice: number | null
  preferredDate: string | null
  confirmedDate: string | null
  createdAt: Date
}

const serviceLabels = {
  prive_regular: 'service1',
  fin_de_bail: 'serviceEndOfTenancy',
  fin_travaux: 'service4',
  bureaux: 'service3',
  cabinet_medical: 'serviceClinic',
  conciergerie: 'serviceConcierge',
  airbnb: 'serviceAirbnb',
} as const

function formatDate(value: Date | string, locale: Locale) {
  const date = typeof value === 'string' ? new Date(`${value}T12:00:00`) : value
  return new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(date)
}

const navItems: { id: Page; icon: typeof Home }[] = [
  { id: 'overview', icon: Home }, { id: 'quotes', icon: FileText }, { id: 'inbox', icon: Mail }, { id: 'clients', icon: Users }, { id: 'settings', icon: Settings2 },
]

export default function CleaningPlatform({ displayName, serviceRequests }: { displayName: string; serviceRequests: OperationRequest[] }) {
  const { locale, setLocale } = useLanguage()
  const [page, setPage] = useState<Page>('overview')
  const [showEstimator, setShowEstimator] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const t = translations[locale]

  const openEstimator = () => setShowEstimator(true)
  const navLabel = (id: Page) => t[id]

  return (
    <main className="platform-shell min-h-screen bg-background text-foreground">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup"><Image src="/hs-quality-service.png" alt="Logotipo de H&S Quality Service" width={42} height={42} priority className="brand-logo" /><div className="brand-copy"><strong>HS Cleaning</strong><a href="https://hs-cleaning.ch" target="_blank" rel="noreferrer">hs-cleaning.ch</a></div><button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label={t.closeMenu}><X size={18} /></button></div>
        <div className="workspace-switch"><div className="workspace-avatar">HS</div><div className="workspace-copy"><strong>HS Cleaning</strong><span>{t.workspacePlan}</span></div><ChevronDown size={15} className="workspace-chevron" /></div>
        <p className="nav-caption">{t.mainMenu}</p>
        <nav className="side-nav" aria-label={t.mainMenu}>
          {navItems.map(({ id, icon: Icon }) => <button key={id} onClick={() => { setPage(id); setMobileNav(false) }} className={`nav-link ${page === id ? 'nav-link-active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{navLabel(id)}</span></button>)}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><div><strong>{t.helpTitle}</strong><p>{t.helpCopy}</p></div><ArrowRight size={15} /></div><Link href="/sign-in" className="profile-row profile-access-row"><div className="profile-avatar"><Users size={16} /></div><div className="profile-copy"><strong>{t.myAccount}</strong><span>{t.accountHint}</span></div><ArrowRight size={16} className="profile-more" /></Link></div>
      </aside>

      {mobileNav && <button className="sidebar-backdrop" aria-label={t.closeMenu} onClick={() => setMobileNav(false)} />}
      <section className="main-column">
        <header className="topbar"><button className="mobile-menu icon-button" aria-label={t.openMenu} onClick={() => setMobileNav(true)}><Menu size={20} /></button><div className="breadcrumb"><a className="domain-link" href="https://hs-cleaning.ch" target="_blank" rel="noreferrer">hs-cleaning.ch</a><ChevronRight size={14} /><strong>{navLabel(page)}</strong></div><div className="topbar-actions"><label className="search-box"><Search size={16} /><input aria-label={t.search} placeholder={t.search} value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label><LanguageSwitcher compact /><Link href="/sign-in" className="platform-account-link">{t.signIn}</Link></div></header>

        <div className="page-content">
          {page === 'overview' && <Overview t={t} locale={locale} displayName={displayName} onEstimate={openEstimator} onNavigate={setPage} search={search} serviceRequests={serviceRequests} />}
          {page === 'quotes' && <Quotes t={t} locale={locale} onEstimate={openEstimator} search={search} serviceRequests={serviceRequests} />}
          {page === 'inbox' && <Inbox t={t} />}
          {page === 'clients' && <Clients t={t} locale={locale} search={search} serviceRequests={serviceRequests} />}
          {page === 'settings' && <Settings t={t} locale={locale} setLocale={setLocale} />}
        </div>
      </section>

      {showEstimator && <QuoteEstimator locale={locale} onClose={() => setShowEstimator(false)} />}
    </main>
  )
}

function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="page-subtitle">{subtitle}</p></div>{action}</div>
}

function Overview({ t, locale, displayName, onEstimate, onNavigate, search, serviceRequests }: { t: typeof translations.es; locale: Locale; displayName: string; onEstimate: () => void; onNavigate: (page: Page) => void; search: string; serviceRequests: OperationRequest[] }) {
  const searchText = search.trim().toLowerCase()
  const filteredRequests = serviceRequests.filter((request) => `${request.name} ${request.email} ${t[serviceLabels[request.serviceType]]}`.toLowerCase().includes(searchText)).slice(0, 6)
  const formatted = (amount: number) => formatCHF(amount, locale)
  const today = new Date()
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const upcomingRequests = serviceRequests.filter((request) => request.status === 'confirmed' && request.confirmedDate && request.confirmedDate >= todayISO).slice(0, 4)
  const reviewCount = serviceRequests.filter((request) => request.status === 'requested' || request.status === 'reviewing').length
  const completedCount = serviceRequests.filter((request) => request.status === 'completed').length
  const metrics = [
    { label: t.totalRequestsMetric, value: String(serviceRequests.length), detail: t.recordsCaption, icon: FileText },
    { label: t.reviewRequestsMetric, value: String(reviewCount), detail: t.reviewCaption, icon: Clock3 },
    { label: t.upcomingMetric, value: String(upcomingRequests.length), detail: t.upcomingCaption, icon: CalendarDays },
    { label: t.completedMetric, value: String(completedCount), detail: t.completedCaption, icon: Check },
  ]
  const statusLabels: Record<OperationRequest['status'], string> = {
    requested: t.waiting,
    reviewing: t.reviewingStatus,
    confirmed: t.confirmed,
    completed: t.completedStatus,
    cancelled: t.cancelledStatus,
  }
  const statusClass = (status: OperationRequest['status']) => status === 'confirmed' || status === 'completed' ? 'status-confirmed' : status === 'requested' || status === 'reviewing' ? 'status-waiting' : 'status-draft'

  return <>
    <PageHeading eyebrow={t.today} title={`${t.greeting}, ${displayName.trim().split(/\s+/)[0]}`} subtitle={t.subtitle} action={<button className="primary-button" onClick={onEstimate}><Plus size={17} />{t.newQuote}</button>} />
    <section className="metrics-grid" aria-label={t.businessMetrics}>{metrics.map(({ label, value, detail, icon: Icon }) => <article className="metric-card" key={label}><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={17} /></span></div><div className="metric-bottom"><strong>{value}</strong></div><p>{detail}</p></article>)}</section>
    <div className="overview-grid"><div className="overview-main"><section className="panel requests-panel"><div className="section-heading"><div><h2>{t.requests}</h2><p>{t.requestsCaption}</p></div><button className="text-button" onClick={() => onNavigate('quotes')}>{t.allRequests}<ArrowRight size={15} /></button></div><div className="table-scroll"><table><thead><tr><th>{t.client}</th><th>{t.service}</th><th>{t.date}</th><th>{t.amount}</th><th>{t.status}</th></tr></thead><tbody>{filteredRequests.map((request) => {
      const requestDate = request.confirmedDate ?? request.preferredDate ?? request.createdAt
      return <tr key={request.id}><td><div className="client-cell"><div className="person-avatar">{request.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div><strong>{request.name}</strong></div></td><td>{t[serviceLabels[request.serviceType]]}</td><td>{formatDate(requestDate, locale)}</td><td className="amount-cell">{formatted(request.confirmedPrice ?? request.estimatedPrice)}</td><td><span className={`status-pill ${statusClass(request.status)}`}><i />{statusLabels[request.status]}</span></td></tr>
    })}</tbody></table>{filteredRequests.length === 0 && <p className="empty-state">{searchText ? t.noResults : t.noRequests}</p>}</div></section>
      <section className="panel schedule-panel"><div className="section-heading"><div><h2>{t.nextJobs}</h2><p>{t.scheduleCaption}</p></div></div>{upcomingRequests.length ? upcomingRequests.map((request) => {
        const date = new Date(`${request.confirmedDate}T12:00:00`)
        return <div className="schedule-row" key={request.id}><div className="schedule-date"><strong>{date.getDate()}</strong><span>{new Intl.DateTimeFormat(`${locale}-CH`, { month: 'short' }).format(date)}</span></div><div className="schedule-details"><strong>{request.name}<span className="schedule-dot" /></strong><span><CalendarDays size={13} /> {t[serviceLabels[request.serviceType]]}</span></div><span className="schedule-amount">{formatted(request.confirmedPrice ?? request.estimatedPrice)}</span></div>
      }) : <p className="empty-state">{t.noScheduledJobs}</p>}</section></div>
      <aside className="overview-aside"><section className="estimate-card"><div className="estimate-graphic"><div className="estimate-icon"><Sparkles size={20} /></div><span className="estimate-orbit orbit-one"/><span className="estimate-orbit orbit-two"/></div><p className="estimate-kicker">{t.quickCalc}</p><h2>{t.estimateTitle}</h2><p className="estimate-copy">{t.estimateText}</p><button className="estimate-button" onClick={onEstimate}>{t.startEstimate}<ArrowRight size={16} /></button><span className="estimate-footnote"><Check size={13} />{t.estimateReassurance}</span></section>
        <section className="panel mini-inbox"><div className="section-heading"><div><h2>{t.inboxTitle}</h2><p>{t.unreadMessagesCaption}</p></div><button className="icon-button small-icon" onClick={() => onNavigate('inbox')} aria-label={t.inbox}><ArrowRight size={16} /></button></div><p className="empty-state">{t.noMessages}</p></section>
      </aside></div>
  </>
}

function Quotes({ t, locale, onEstimate, search, serviceRequests }: { t: typeof translations.es; locale: Locale; onEstimate: () => void; search: string; serviceRequests: OperationRequest[] }) {
  const searchText = search.trim().toLowerCase()
  const items = serviceRequests.filter((request) => `${request.name} ${request.email} ${request.id} ${t[serviceLabels[request.serviceType]]}`.toLowerCase().includes(searchText))
  const statusLabels: Record<OperationRequest['status'], string> = {
    requested: t.waiting,
    reviewing: t.reviewingStatus,
    confirmed: t.confirmed,
    completed: t.completedStatus,
    cancelled: t.cancelledStatus,
  }
  const statusClass = (status: OperationRequest['status']) => status === 'confirmed' || status === 'completed' ? 'status-confirmed' : status === 'requested' || status === 'reviewing' ? 'status-waiting' : 'status-draft'
  return <><PageHeading eyebrow={t.management} title={t.quotePage} subtitle={t.quoteDesc} action={<button className="primary-button" onClick={onEstimate}><Plus size={17} />{t.newQuote}</button>} /><section className="panel full-table-panel"><div className="list-toolbar"><div className="inbox-list-heading"><h2>{items.length} {t.requests}</h2><span>{t.requestsCaption}</span></div></div><div className="table-scroll"><table><thead><tr><th>{t.reference}</th><th>{t.client}</th><th>{t.service}</th><th>{t.date}</th><th>{t.amount}</th><th>{t.status}</th></tr></thead><tbody>{items.map((request) => <tr key={request.id}><td className="quote-id">{request.id.slice(0, 8)}</td><td><div className="client-cell"><div className="person-avatar">{request.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div><strong>{request.name}</strong></div></td><td>{t[serviceLabels[request.serviceType]]}</td><td>{formatDate(request.confirmedDate ?? request.preferredDate ?? request.createdAt, locale)}</td><td className="amount-cell">{formatCHF(request.confirmedPrice ?? request.estimatedPrice, locale)}</td><td><span className={`status-pill ${statusClass(request.status)}`}><i />{statusLabels[request.status]}</span></td></tr>)}</tbody></table>{items.length === 0 && <p className="empty-state">{searchText ? t.noResults : t.noRequests}</p>}</div></section></>
}

function Inbox({ t }: { t: typeof translations.es }) {
  return <><PageHeading eyebrow={t.communication} title={t.inbox} subtitle={t.inboxDesc} /><section className="panel empty-state inbox-empty-state">{t.noMessages}</section></>
}

function Clients({ t, locale, search, serviceRequests }: { t: typeof translations.es; locale: Locale; search: string; serviceRequests: OperationRequest[] }) {
  const clients = serviceRequests.reduce<Array<{ userId: string; name: string; email: string; requestCount: number; lastRequested: Date }>>((records, request) => {
    const client = records.find((record) => record.userId === request.userId)
    if (client) {
      client.requestCount += 1
    } else {
      records.push({ userId: request.userId, name: request.name, email: request.email, requestCount: 1, lastRequested: request.createdAt })
    }
    return records
  }, [])
  const searchText = search.trim().toLowerCase()
  const filtered = clients.filter((client) => `${client.name} ${client.email}`.toLowerCase().includes(searchText))
  return <><PageHeading eyebrow={t.relationships} title={t.clients} subtitle={t.clientsDesc} /><section className="panel full-table-panel"><div className="list-toolbar"><div className="inbox-list-heading"><h2>{clients.length} {t.clients}</h2><span>{t.clientRecordsCaption}</span></div></div><div className="table-scroll"><table><thead><tr><th>{t.client}</th><th>{t.emailLabel}</th><th>{t.servicesLabel}</th><th>{t.lastRequest}</th><th /></tr></thead><tbody>{filtered.map((client) => <tr key={client.userId}><td><div className="client-cell"><div className="person-avatar">{client.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div><strong>{client.name}</strong></div></td><td>{client.email}</td><td>{client.requestCount}</td><td>{formatDate(client.lastRequested, locale)}</td><td><a href={`mailto:${client.email}`} className="icon-button small-icon" aria-label={`Email ${client.name}`}><Mail size={16} /></a></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="empty-state">{searchText ? t.noResults : t.noClientsWithRequests}</p>}</div></section></>
}

function Settings({ t, locale, setLocale }: { t: typeof translations.es; locale: Locale; setLocale: (locale: Locale) => void }) {
  return <><PageHeading eyebrow={t.settingsEyebrow} title={t.settings} subtitle={t.settingsDesc} /><section className="panel settings-panel"><div className="settings-section"><div><h2>{t.languagePreference}</h2><p>{t.languagePreferenceCopy}</p></div><div className="settings-options">{(['es', 'fr', 'en'] as Locale[]).map((language) => <button key={language} className={`language-option ${locale === language ? 'language-option-active' : ''}`} onClick={() => setLocale(language)}><Languages size={17} /><span>{language === 'es' ? 'Español' : language === 'fr' ? 'Français' : 'English'}</span>{locale === language && <Check size={16} />}</button>)}</div></div><div className="settings-section"><div><h2>{t.emailNotifications}</h2><p>{t.emailNotificationsCopy}</p></div><button className="toggle-switch" aria-label={t.emailNotifications} aria-pressed="true"><span /></button></div><div className="settings-section"><div><h2>{t.businessInfo}</h2><p>{t.businessLocation}</p></div><button className="secondary-button">{t.editInfo}</button></div></section></>
}

function Estimator({ t, locale, onClose, onCreate }: { t: typeof translations.es; locale: Locale; onClose: () => void; onCreate: (quote: { name: string; email: string; amount: number }) => void }) {
  const [property, setProperty] = useState('apartment')
  const [area, setArea] = useState(75)
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(1)
  const [frequency, setFrequency] = useState('oneTime')
  const [extras, setExtras] = useState<string[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [created, setCreated] = useState(false)
  const formatter = { format: (amount: number) => formatCHF(amount, locale) }
  const total = useMemo(() => {
    const base = property === 'office' ? 55 : property === 'house' ? 42 : 35
    const frequencyDiscount = frequency === 'weekly' ? 0.78 : frequency === 'biweekly' ? 0.86 : frequency === 'monthly' ? 0.93 : 1
    return Math.round((base + Math.max(0, area - 35) * 0.65 + bedrooms * 8 + bathrooms * 10 + extras.reduce((sum, item) => sum + ({ windows: 18, oven: 15, fridge: 12, deep: 35 }[item] ?? 0), 0)) * frequencyDiscount)
  }, [property, area, bedrooms, bathrooms, frequency, extras])
  const toggleExtra = (id: string) => setExtras((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="estimator-modal" role="dialog" aria-modal="true" aria-labelledby="estimator-title"><header className="modal-header"><div className="modal-title-icon"><Sparkles size={19} /></div><div><p className="eyebrow">{t.estimatorKicker}</p><h2 id="estimator-title">{t.estimator}</h2><p>{t.estimatorHint}</p></div><button className="icon-button modal-close" onClick={onClose} aria-label={t.cancel}><X size={19} /></button></header>{created ? <div className="quote-success"><div className="success-check"><Check size={24} /></div><h3>{t.quoteReady}</h3><p>{name || 'Cliente'} · {formatter.format(total)}</p><a className="primary-button" href={`mailto:${email}?subject=${encodeURIComponent(t.emailSubject)}&body=${encodeURIComponent(`${t.emailGreeting} ${name || ''},\n\n${t.emailIntro}: ${formatter.format(total)} ${t.perVisit}.\n\n${t.disclaimer}\n\n${t.emailSignoff},\nHS Cleaning`)}`}><Send size={15} />{t.sendEmail}</a><button className="text-button success-close" onClick={onClose}>{t.cancel}</button></div> : <><div className="modal-content"><div className="form-grid"><label className="field-label">{t.property}<select value={property} onChange={(event) => setProperty(event.target.value)}><option value="apartment">{t.apartment}</option><option value="house">{t.house}</option><option value="office">{t.office}</option></select></label><label className="field-label">{t.area} (m²)<div className="number-input"><button type="button" aria-label="Decrease area" onClick={() => setArea((value) => Math.max(20, value - 10))}><ChevronLeft size={16} /></button><input type="number" min="20" max="1000" value={area} onChange={(event) => setArea(Math.max(20, Number(event.target.value) || 20))} /><button type="button" aria-label="Increase area" onClick={() => setArea((value) => Math.min(1000, value + 10))}><ChevronRight size={16} /></button></div></label><label className="field-label">{t.bedrooms}<select value={bedrooms} onChange={(event) => setBedrooms(Number(event.target.value))}>{[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></label><label className="field-label">{t.bathrooms}<select value={bathrooms} onChange={(event) => setBathrooms(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select></label></div><label className="field-label frequency-label">{t.frequency}<select value={frequency} onChange={(event) => setFrequency(event.target.value)}><option value="oneTime">{t.oneTime}</option><option value="weekly">{t.weekly}</option><option value="biweekly">{t.biweekly}</option><option value="monthly">{t.monthly}</option></select></label><fieldset className="extras-fieldset"><legend>{t.extras}</legend><div className="extras-grid">{[['windows', t.windows], ['oven', t.oven], ['fridge', t.fridge], ['deep', t.deep]].map(([id, label]) => <label className={`extra-option ${extras.includes(id) ? 'extra-option-active' : ''}`} key={id}><input type="checkbox" checked={extras.includes(id)} onChange={() => toggleExtra(id)} /><span className="custom-check">{extras.includes(id) && <Check size={12} />}</span>{label}</label>)}</div></fieldset><div className="client-fields"><label className="field-label">{t.clientName}<input placeholder="Cliente" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="field-label">{t.email}<input type="email" placeholder="sophie@email.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label></div><div className="estimate-total"><div><span>{t.estimated}</span><small>{t.perVisit}</small></div><strong>{formatter.format(total)}</strong></div><p className="estimate-disclaimer">{t.disclaimer}</p></div><footer className="modal-footer"><button className="secondary-button" onClick={onClose}>{t.cancel}</button><button className="primary-button" disabled={!name.trim() || !email.includes('@') || !email.includes('.')} onClick={() => { setCreated(true); onCreate({ name: name.trim(), email: email.trim(), amount: total }) }}><FileText size={16} />{t.create}</button></footer></>}</section></div>
}
