'use client'

import { useEffect, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  BadgeCheck,
  Check,
  ClipboardList,
  Heart,
  Clock3,
  Construction,
  BedDouble,
  House,
  KeyRound,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cancelClientServiceRequest, submitClientServiceRequest } from '@/app/actions/account'
import { ClientScheduleAction } from '@/components/staff-schedule-panel'
import { ClientDashboardPromo } from '@/components/client-dashboard-promo'
import type { ScheduleProposal } from '@/lib/scheduling-copy'
import { useLanguage } from '@/components/language-provider'
import { messages, type Locale } from '@/lib/i18n'
import { calculateClientQuote, cantonOptions, clientServiceTypes, emptyClientQuoteDetails, EXTRA_PRICES, getClientPostalCanton, isMountainClientPostalCode, type ClientCanton, type ClientPropertyType, type ClientQuoteDetails, type ClientServiceType } from '@/lib/client-pricing'

type QuoteAssistantResponse = {
  property: 'apartment' | 'studio' | 'house' | 'farm' | 'airbnb' | 'office' | 'shop' | 'clinic' | 'concierge' | null
  serviceType: 'standard' | 'endOfTenancy' | 'postConstruction' | null
  area: number | null
  extras: Array<'windows' | 'oven' | 'fridge' | 'terrace'>
  inventory: {
    bathrooms: number | null
    bedrooms: number | null
    kitchens: number | null
    livingRooms: number | null
    offices: number | null
    tables: number | null
    desks: number | null
    vitrines: number | null
    windows: number | null
    wallArea: number | null
    windowArea: number | null
    terraceArea: number | null
    cleanWalls: boolean
    postConstructionDust: boolean
    paintMarks: boolean
  }
  summary: string
  question: string | null
  source: 'ai' | 'fallback'
}

type RequestItem = {
  id: string
  serviceType: ClientServiceType
  canton: ClientCanton
  postalCode: string | null
  bathrooms: number
  surfaceArea: number
  windowArea: number
  quoteDetails: ClientQuoteDetails
  estimatedPrice: number
  estimatedHours: number
  crewSize: number
  preferredDate: string | null
  confirmedDate: string | null
  confirmedPrice: number | null
  assignedStaffName: string | null
  proposal: ScheduleProposal | null
  status: 'requested' | 'reviewing' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

const serviceIcons: Record<ClientServiceType, LucideIcon> = {
  prive_regular: House,
  fin_de_bail: KeyRound,
  fin_travaux: Construction,
  bureaux: BriefcaseBusiness,
  cabinet_medical: Stethoscope,
  conciergerie: BriefcaseBusiness,
  airbnb: BedDouble,
}

const serviceTypes = Object.entries(clientServiceTypes) as [ClientServiceType, { label: string }][]
const assistantCopy = {
  es: { title: 'Completa el cotizador con IA', hint: 'Describe el espacio y el trabajo. La IA rellenará el inventario y actualizará el precio.', placeholder: 'Ej.: apartamento de 90 m², 3 habitaciones, 1 cocina y 2 baños; limpiar horno y ventanas de 12 m².', analyze: 'Analizar descripción', analyzing: 'Analizando…', tooShort: 'Describe el trabajo con al menos 12 caracteres.', error: 'No se pudo analizar el texto. Completa los campos manualmente.', understood: 'Interpretación aplicada', fallback: 'Análisis local aplicado', followUp: 'Por confirmar', },
  fr: { title: 'Remplir le devis avec l’IA', hint: 'Décrivez le logement et les travaux. L’IA remplira l’inventaire et actualisera le prix.', placeholder: 'Ex. : appartement de 90 m², 3 chambres, 1 cuisine et 2 salles de bains ; four et 12 m² de vitres.', analyze: 'Analyser la description', analyzing: 'Analyse…', tooShort: 'Décrivez la prestation en au moins 12 caractères.', error: 'Impossible d’analyser le texte. Remplissez les champs manuellement.', understood: 'Interprétation appliquée', fallback: 'Analyse locale appliquée', followUp: 'À confirmer', },
  en: { title: 'Fill the quote with AI', hint: 'Describe the property and work. AI will fill the inventory and update the price.', placeholder: 'E.g. 90 m² apartment, 3 bedrooms, 1 kitchen and 2 bathrooms; clean oven and 12 m² of windows.', analyze: 'Analyze description', analyzing: 'Analyzing…', tooShort: 'Describe the work in at least 12 characters.', error: 'The description could not be analyzed. Complete the fields manually.', understood: 'Interpretation applied', fallback: 'Local analysis applied', followUp: 'To confirm', },
} satisfies Record<Locale, Record<string, string>>
const clientWorkflowCopy = {
  es: {
    tabsLabel: 'Secciones de tu cuenta', explanation: 'Cómo funciona', booking: 'Reservar una limpieza',
    heading: 'Una limpieza de calidad, en tres pasos',
    steps: [
      { title: 'Cuéntanos qué necesitas', description: 'Elige un servicio, añade los detalles del espacio y consulta una estimación antes de enviar la solicitud.' },
      { title: 'Revisamos tu solicitud', description: 'Nuestro equipo revisará la información y se pondrá en contacto contigo para organizar el servicio.' },
      { title: 'Disfruta de tu tiempo', description: 'Realizaremos la limpieza según los detalles y las preferencias acordadas.' },
    ],
    start: 'Solicitar una limpieza',
  },
  fr: {
    tabsLabel: 'Sections de votre compte', explanation: 'Comment ça fonctionne', booking: 'Réserver un ménage',
    heading: 'Un nettoyage de qualité en trois étapes',
    steps: [
      { title: 'Décrivez votre besoin', description: 'Choisissez une prestation, ajoutez les détails du logement et consultez une estimation avant d’envoyer votre demande.' },
      { title: 'Nous étudions votre demande', description: 'Notre équipe examine les informations et vous contacte pour organiser la prestation.' },
      { title: 'Profitez de votre temps libre', description: 'Nous réalisons le nettoyage selon les détails et les préférences convenus.' },
    ],
    start: 'Demander un ménage',
  },
  en: {
    tabsLabel: 'Account sections', explanation: 'How it works', booking: 'Book a cleaning',
    heading: 'Quality cleaning in three simple steps',
    steps: [
      { title: 'Tell us what you need', description: 'Choose a service, add details about your space, and review an estimate before sending your request.' },
      { title: 'We review your request', description: 'Our team will review the details and contact you to arrange the service.' },
      { title: 'Enjoy your free time', description: 'We will clean your space according to the details and preferences you agree on.' },
    ],
    start: 'Request a cleaning',
  },
} satisfies Record<Locale, { tabsLabel: string; explanation: string; booking: string; heading: string; steps: { title: string; description: string }[]; start: string }>
const clientTrustCopy = {
  es: {
    tab: 'Sobre nosotros y confianza', heading: 'Un servicio pensado para tu tranquilidad',
    cards: [
      { title: 'Sin trámites para ti', description: 'Con HS Quality Service, no eres el empleador. Gestionamos los contratos, las declaraciones y las cotizaciones sociales. Tú reservas; nosotros nos ocupamos del resto.' },
      { title: 'Equipo declarado y asegurado', description: 'Combatimos el trabajo no declarado en el sector de la limpieza en Suiza. Nuestro personal está contratado legalmente, declarado ante las autoridades y cubierto por un seguro de responsabilidad civil.' },
      { title: 'Garantía de entrega incluida', description: 'Para limpiezas de fin de alquiler o mudanza, la prestación incluye una garantía de entrega para tu agencia inmobiliaria. Si durante la inspección solicitan un retoque, nuestro equipo vuelve a realizarlo sin coste adicional.' },
    ],
  },
  fr: {
    tab: 'À propos et confiance', heading: 'Un service conçu pour votre tranquillité',
    cards: [
      { title: 'Zéro paperasse administrative', description: 'Chez H&S Quality Service, vous n�����êtes pas l’employeur. Nous gérons les contrats de travail, les déclarations et les cotisations sociales (AVS, AI, APG). Vous réservez, nous nous occupons du reste.' },
      { title: 'Équipe déclarée et assurée', description: 'Nous luttons contre le travail non déclaré dans le secteur du nettoyage en Suisse. Notre équipe est engagée légalement, déclarée auprès des caisses cantonales et couverte par une assurance responsabilité civile.' },
      { title: 'Garantie de remise incluse', description: 'Pour les nettoyages de fin de bail ou de déménagement, la prestation inclut une garantie de remise pour votre régie. Si une retouche est demandée lors de l’état des lieux, notre équipe intervient à nouveau sans frais supplémentaires.' },
    ],
  },
  en: {
    tab: 'About & trust', heading: 'A service designed for peace of mind',
    cards: [
      { title: 'No administrative paperwork', description: 'With H&S Quality Service, you are not the employer. We manage employment contracts, declarations, and social contributions. You book; we take care of the rest.' },
      { title: 'A declared and insured team', description: 'We work against undeclared work in Switzerland’s cleaning sector. Our team is legally employed, registered with the relevant authorities, and covered by liability insurance.' },
      { title: 'Move-out handover guarantee', description: 'For end-of-tenancy and moving cleans, the service includes a handover guarantee for your property manager. If a touch-up is requested during the inspection, our team returns to take care of it at no extra charge.' },
    ],
  },
} satisfies Record<Locale, { tab: string; heading: string; cards: { title: string; description: string }[] }>
const cantonNames: Record<ClientCanton, Record<Locale, string>> = {
  GE: { es: 'Ginebra (GE)', fr: 'Genève (GE)', en: 'Geneva (GE)' },
  VD: { es: 'Vaud / Lausana (VD)', fr: 'Vaud / Lausanne (VD)', en: 'Vaud / Lausanne (VD)' },
  FR: { es: 'Friburgo (FR)', fr: 'Fribourg (FR)', en: 'Fribourg (FR)' },
  NE: { es: 'Neuchâtel (NE)', fr: 'Neuchâtel (NE)', en: 'Neuchâtel (NE)' },
  VS: { es: 'Valais (VS)', fr: 'Valais (VS)', en: 'Valais (VS)' },
}
const money = (value: number, locale: Locale) => new Intl.NumberFormat(`${locale}-CH`, { style: 'currency', currency: 'CHF', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

const inventoryCopy = {
  es: { client: 'Datos del cliente', email: 'Correo electrónico', phone: 'Teléfono', customerAddress: 'Dirección', propertyType: 'Tipo de propiedad', apartment: 'Apartamento', studio: 'Estudio', house: 'Casa', farm: 'Finca', office: 'Oficina', shop: 'Tienda', airbnb: 'Airbnb / alquiler vacacional', inventory: 'Inventario de espacios', bedrooms: 'Habitaciones', kitchens: 'Cocinas', livingRooms: 'Salones', offices: 'Oficinas', bathrooms: 'Baños', tables: 'Mesas', desks: 'Escritorios', vitrines: 'Vitrinas', windows: 'Ventanas', windowsArea: 'Superficie de ventanas (m²)', wallArea: 'Superficie de muros (m²)', terraceArea: 'Superficie de terraza (m²)', cleanWalls: 'Limpieza de muros', constructionDust: 'Polvo de fin de obra', paintMarks: 'Manchas de pintura en muros', propertyTasks: 'Trabajos especiales', lineBase: 'Tarifa fija', lineLabor: 'Mano de obra', lineWalls: 'Limpieza de muros', lineDust: 'Polvo de fin de obra', linePaint: 'Tratamiento de pintura', lineWindows: 'Ventanas', lineTerrace: 'Terraza' },
  fr: { client: 'Coordonnées du client', email: 'E-mail', phone: 'Téléphone', customerAddress: 'Adresse', propertyType: 'Type de logement', apartment: 'Appartement', studio: 'Studio', house: 'Maison', farm: 'Ferme / domaine', office: 'Bureau', shop: 'Commerce', airbnb: 'Airbnb / location saisonnière', inventory: 'Inventaire des espaces', bedrooms: 'Chambres', kitchens: 'Cuisines', livingRooms: 'Séjours', offices: 'Bureaux', bathrooms: 'Salles de bains', tables: 'Tables', desks: 'Bureaux / postes', vitrines: 'Vitrines', windows: 'Fenêtres', windowsArea: 'Surface des vitres (m²)', wallArea: 'Surface des murs (m²)', terraceArea: 'Surface de terrasse (m²)', cleanWalls: 'Nettoyage des murs', constructionDust: 'Poussière de fin de chantier', paintMarks: 'Traces de peinture sur les murs', propertyTasks: 'Travaux spécifiques', lineBase: 'Forfait', lineLabor: 'Main-d’œuvre', lineWalls: 'Nettoyage des murs', lineDust: 'Poussière de chantier', linePaint: 'Traitement des traces de peinture', lineWindows: 'Vitres', lineTerrace: 'Terrasse' },
  en: { client: 'Client details', email: 'Email', phone: 'Phone', customerAddress: 'Address', propertyType: 'Property type', apartment: 'Apartment', studio: 'Studio', house: 'House', farm: 'Farm / estate', office: 'Office', shop: 'Shop', airbnb: 'Airbnb / holiday rental', inventory: 'Room-by-room inventory', bedrooms: 'Bedrooms', kitchens: 'Kitchens', livingRooms: 'Living rooms', offices: 'Offices', bathrooms: 'Bathrooms', tables: 'Tables', desks: 'Desks', vitrines: 'Display windows', windows: 'Windows', windowsArea: 'Window area (m²)', wallArea: 'Wall area (m²)', terraceArea: 'Terrace area (m²)', cleanWalls: 'Wall cleaning', constructionDust: 'Post-construction dust', paintMarks: 'Paint marks on walls', propertyTasks: 'Special cleaning tasks', lineBase: 'Fixed fee', lineLabor: 'Labor', lineWalls: 'Wall cleaning', lineDust: 'Post-construction dust', linePaint: 'Paint mark treatment', lineWindows: 'Windows', lineTerrace: 'Terrace' },
} as const

const materialTypes = ['wood', 'stainless', 'metals', 'marble', 'glass', 'ceramic'] as const
type MaterialType = (typeof materialTypes)[number]
const materialGuideCopy = {
  es: {
    title: 'El cuidado adecuado para cada material',
    intro: 'Selecciona una superficie para ver un ejemplo de producto y una forma segura de limpiarla.',
    select: 'Ver consejos',
    productLabel: 'Producto de ejemplo',
    methodLabel: 'Consejo de limpieza',
    note: 'Los acabados pueden variar: prueba primero en una zona poco visible y sigue siempre la etiqueta del fabricante.',
    materials: {
      wood: { name: 'Madera', product: 'Limpiador suave específico para madera o jabón neutro diluido.', method: 'Usa un paño apenas húmedo, sigue la veta y seca enseguida. No empapes la madera.' },
      stainless: { name: 'Acero inoxidable', product: 'Agua con unas gotas de jabón neutro o un limpiador indicado para acero inoxidable.', method: 'Limpia en la dirección del acabado con microfibra y seca para evitar marcas. Evita estropajos y productos clorados.' },
      metals: { name: 'Metales', product: 'Limpiador suave compatible con el acabado del latón, cromo u otro metal.', method: 'Prueba primero en una zona discreta y pule con un paño suave. Evita abrasivos y productos ácidos.' },
      marble: { name: 'Mármol y piedra', product: 'Limpiador de pH neutro aprobado para piedra natural.', method: 'Limpia sin demora y seca con un paño suave. No uses vinagre, limón ni productos antical.' },
      glass: { name: 'Vidrio y ventanas', product: 'Limpiacristales sin residuos o agua con una pequeña cantidad de jabón neutro.', method: 'Limpia con microfibra o rasqueta, trabajando de arriba abajo; evita el sol directo para reducir marcas.' },
      ceramic: { name: 'Cerámica y azulejos', product: 'Limpiador neutro apto para cerámica y porcelana.', method: 'Pasa un paño suave y aclara si el producto lo requiere. Trata las juntas por separado y no mezcles limpiadores.' },
    },
  },
  fr: {
    title: 'Le bon entretien pour chaque matériau',
    intro: 'Sélectionnez une surface pour découvrir un exemple de produit et un conseil de nettoyage.',
    select: 'Voir les conseils',
    productLabel: 'Exemple de produit',
    methodLabel: 'Conseil de nettoyage',
    note: 'Les finitions varient : testez d’abord sur une zone discrète et suivez toujours l’étiquette du fabricant.',
    materials: {
      wood: { name: 'Bois', product: 'Nettoyant doux spécial bois ou savon neutre dilué.', method: 'Utilisez un chiffon à peine humide, suivez le fil du bois et séchez aussitôt. Ne détrempez pas le bois.' },
      stainless: { name: 'Acier inoxydable', product: 'Eau avec quelques gouttes de savon neutre ou nettoyant spécial inox.', method: 'Nettoyez dans le sens du brossage avec une microfibre, puis séchez. Évitez les éponges abrasives et les produits chlorés.' },
      metals: { name: 'Métaux', product: 'Nettoyant doux compatible avec la finition du laiton, du chrome ou du métal concerné.', method: 'Faites un essai sur une zone discrète et lustrez avec un chiffon doux. Évitez les abrasifs et les produits acides.' },
      marble: { name: 'Marbre et pierre', product: 'Nettoyant au pH neutre adapté à la pierre naturelle.', method: 'Nettoyez sans attendre et séchez avec un chiffon doux. Évitez le vinaigre, le citron et les détartrants.' },
      glass: { name: 'Vitres et verre', product: 'Nettoyant vitres sans traces ou eau avec une petite quantité de savon neutre.', method: 'Nettoyez avec une microfibre ou une raclette, de haut en bas ; évitez le soleil direct pour limiter les traces.' },
      ceramic: { name: 'Céramique et carrelage', product: 'Nettoyant neutre adapté à la céramique et à la porcelaine.', method: 'Passez un chiffon doux et rincez si le produit le demande. Traitez les joints séparément et ne mélangez pas les produits.' },
    },
  },
  en: {
    title: 'The right care for every material',
    intro: 'Choose a surface to see a suitable product example and a practical cleaning tip.',
    select: 'View tips',
    productLabel: 'Example product',
    methodLabel: 'Cleaning tip',
    note: 'Finishes vary: test on a discreet spot first and always follow the product label.',
    materials: {
      wood: { name: 'Wood', product: 'A gentle wood-safe cleaner or diluted pH-neutral soap.', method: 'Use a barely damp cloth, follow the grain, and dry promptly. Do not soak the wood.' },
      stainless: { name: 'Stainless steel', product: 'Water with a few drops of mild soap or a stainless-steel-specific cleaner.', method: 'Wipe with the grain using microfiber, then dry to prevent streaks. Avoid abrasive pads and chlorine-based cleaners.' },
      metals: { name: 'Metals', product: 'A mild cleaner compatible with the finish, such as brass or chrome.', method: 'Test on a discreet spot and polish with a soft cloth. Avoid abrasive and acidic cleaners.' },
      marble: { name: 'Marble and stone', product: 'A pH-neutral cleaner approved for natural stone.', method: 'Clean spills promptly and dry with a soft cloth. Avoid vinegar, lemon, and limescale removers.' },
      glass: { name: 'Glass and windows', product: 'A streak-free glass cleaner or water with a small amount of mild soap.', method: 'Use microfiber or a squeegee from top to bottom; avoid direct sunlight to reduce streaks.' },
      ceramic: { name: 'Ceramic and tile', product: 'A neutral cleaner suitable for ceramic and porcelain.', method: 'Wipe with a soft cloth and rinse if the label recommends it. Treat grout separately and never mix cleaners.' },
    },
  },
} satisfies Record<Locale, { title: string; intro: string; select: string; productLabel: string; methodLabel: string; note: string; materials: Record<MaterialType, { name: string; product: string; method: string }> }>
const materialImages: Record<MaterialType, string> = {
  wood: '/material-guides/wood.png',
  stainless: '/material-guides/stainless-steel.png',
  metals: '/material-guides/metals.png',
  marble: '/material-guides/marble.png',
  glass: '/material-guides/glass.png',
  ceramic: '/material-guides/ceramic.png',
}

const propertyTypeOptions: ClientPropertyType[] = ['apartment', 'studio', 'house', 'farm', 'office', 'shop', 'airbnb']

export function ClientServicePortal({ requests, customer, isDeletionPending = false, securityContent }: { requests: RequestItem[]; customer: { name: string; email: string; phone: string; address: string; postalCode: string; companyName: string | null }; isDeletionPending?: boolean; securityContent: ReactNode }) {
  const router = useRouter()
  const { locale } = useLanguage()
  const [activeTab, setActiveTab] = useState<'booking' | 'activity' | 'explanation' | 'trust'>(isDeletionPending ? 'trust' : 'booking')
  const [activeStep, setActiveStep] = useState(0)
  const [activeTrustCard, setActiveTrustCard] = useState(0)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | null>(null)
  const [activeBookingSection, setActiveBookingSection] = useState('service')
  const t = messages[locale].services
  const workflow = clientWorkflowCopy[locale]
  const trust = clientTrustCopy[locale]
  const materialGuide = materialGuideCopy[locale]
  const adminT = messages[locale].admin
  const visibleTabs: ('booking' | 'activity' | 'explanation' | 'trust')[] = isDeletionPending ? ['trust'] : ['booking', 'activity', 'explanation', 'trust']

  function focusBookingSection(id: string, target: string) {
    setActiveBookingSection(id)
    const section = document.getElementById(target)
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    section?.focus({ preventScroll: true })
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = visibleTabs.indexOf(activeTab)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? visibleTabs.length - 1
        : (currentIndex + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + visibleTabs.length) % visibleTabs.length
    const nextTab = visibleTabs[nextIndex]
    setActiveTab(nextTab)
    document.getElementById(`client-${nextTab}-tab`)?.focus()
  }

  useEffect(() => {
    const selectTabForHash = (hash: string) => {
      const tab = hash === '#client-new-quote'
        ? isDeletionPending ? 'trust' : 'booking'
        : hash === '#client-activity'
          ? isDeletionPending ? 'trust' : 'activity'
          : hash === '#client-trust' ? 'trust' : null
      if (!tab) return

      setActiveTab(tab)
      const panelId = tab === 'booking' ? 'client-booking-panel' : tab === 'activity' ? 'client-activity' : 'client-trust'
      requestAnimationFrame(() => document.getElementById(panelId)?.focus({ preventScroll: true }))
    }
    const openDashboardTabFromHash = () => selectTabForHash(window.location.hash)
    const handleDashboardNavigation = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>('.account-dashboard-nav a')
      if (!link) return

      event.preventDefault()
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${link.hash}`)
      selectTabForHash(link.hash)
      const targetId = link.hash === '#client-new-quote' ? 'client-booking-panel' : link.hash.slice(1)
      requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }

    openDashboardTabFromHash()
    window.addEventListener('hashchange', openDashboardTabFromHash)
    document.addEventListener('click', handleDashboardNavigation)
    return () => {
      window.removeEventListener('hashchange', openDashboardTabFromHash)
      document.removeEventListener('click', handleDashboardNavigation)
    }
  }, [isDeletionPending])
  const statusLabels: Record<RequestItem['status'], string> = {
    requested: messages[locale].admin.received,
    reviewing: messages[locale].admin.reviewing,
    confirmed: messages[locale].admin.confirmed,
    completed: messages[locale].admin.completed,
    cancelled: messages[locale].admin.cancelled,
  }
  const serviceLabels: Record<ClientServiceType, string> = {
    prive_regular: t.regular,
    fin_de_bail: t.tenancy,
    fin_travaux: t.construction,
    bureaux: t.offices,
    cabinet_medical: t.medical,
    conciergerie: locale === 'fr' ? 'Conciergerie' : locale === 'en' ? 'Property management' : 'Conserjería',
    airbnb: locale === 'fr' ? 'Airbnb / location saisonnière' : locale === 'en' ? 'Airbnb / holiday rental' : 'Airbnb / alquiler vacacional',
  }
  const serviceDescriptions: Record<ClientServiceType, { description: string; context: string }> = {
    prive_regular: { description: t.regularDescription, context: t.regularContext },
    fin_de_bail: { description: t.tenancyDescription, context: t.tenancyContext },
    fin_travaux: { description: t.constructionDescription, context: t.constructionContext },
    bureaux: { description: t.officesDescription, context: t.officesContext },
    cabinet_medical: { description: t.medicalDescription, context: t.medicalContext },
    conciergerie: {
      description: locale === 'fr' ? 'Entretien professionnel des espaces et parties communes.' : locale === 'en' ? 'Professional cleaning for managed properties and common areas.' : 'Limpieza profesional de propiedades y zonas comunes gestionadas.',
      context: locale === 'fr' ? 'Prestations de conciergerie' : locale === 'en' ? 'Property management services' : 'Servicios de conserjería',
    },
    airbnb: {
      description: locale === 'fr' ? 'Tarification calculée selon le NPA du logement.' : locale === 'en' ? 'Pricing is calculated from the property postal code.' : 'Tarifa calculada según el NPA del alojamiento.',
      context: locale === 'fr' ? 'Tarifs régionaux pour la location saisonnière' : locale === 'en' ? 'Regional rates for short-term rentals' : 'Tarifas regionales para alquileres vacacionales',
    },
  }
  const inventory = inventoryCopy[locale]
  const bookingMenuTitle = locale === 'fr' ? 'Votre demande' : locale === 'en' ? 'Your request' : 'Tu solicitud'
  const bookingMenuItems = [
    { id: 'ai', target: 'client-booking-ai', label: assistantCopy[locale].title },
    { id: 'service', target: 'client-booking-service', label: t.choose },
    { id: 'space', target: 'client-booking-space', label: t.space },
    { id: 'contact', target: 'client-booking-contact', label: inventory.client },
    { id: 'logistics', target: 'client-booking-logistics', label: locale === 'fr' ? 'Accès et logistique' : locale === 'en' ? 'Access and logistics' : 'Acceso y logística' },
    { id: 'extras', target: 'client-booking-extras', label: t.extrasTitle },
    { id: 'timing', target: 'client-booking-timing', label: t.timing },
  ]
  const pricingLabels = locale === 'fr'
    ? { postalCode: 'NPA (Code postal)', bathrooms: 'Nombre de salles de bain', hours: 'Durée estimée', net: 'Prix net', vat: 'TVA (8.1%)', mountain: 'Tarification suisse premium pour Airbnb (Base CHF 120 + Hora CHF 50/h)' }
    : locale === 'en'
      ? { postalCode: 'Postal code (NPA)', bathrooms: 'Bathrooms', hours: 'Estimated duration', net: 'Net price', vat: 'VAT (8.1%)', mountain: 'Swiss premium Airbnb pricing (Base CHF 120 + Hour CHF 50/h)' }
      : { postalCode: 'NPA (Código postal)', bathrooms: 'Número de baños', hours: 'Duración estimada', net: 'Precio neto', vat: 'IVA (8.1%)', mountain: 'Tarificación suiza premium para Airbnb (Base CHF 120 + Hora CHF 50/h)' }
  const [serviceType, setServiceType] = useState<ClientServiceType>('prive_regular')
  const [postalCode, setPostalCode] = useState(/^\d{4}$/.test(customer.postalCode) ? customer.postalCode : '1200')
  const [canton, setCanton] = useState<ClientCanton>('GE')
  const [surfaceArea, setSurfaceArea] = useState(75)
  const [bathrooms, setBathrooms] = useState(1)
  const [aiDescription, setAiDescription] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiResult, setAiResult] = useState<{ summary: string; question: string | null; source: 'ai' | 'fallback' } | null>(null)
  const [windowArea, setWindowArea] = useState(0)
  const [terraceArea, setTerraceArea] = useState(0)
  const [details, setDetails] = useState<ClientQuoteDetails>(emptyClientQuoteDetails)
  const updateDetail = <K extends keyof ClientQuoteDetails>(key: K, value: ClientQuoteDetails[K]) => setDetails((current) => ({ ...current, [key]: value }))
  const [includeOven, setIncludeOven] = useState(false)
  const [includeFridge, setIncludeFridge] = useState(false)
  const [includeWindows, setIncludeWindows] = useState(false)
  const [includeTerrace, setIncludeTerrace] = useState(false)
  const [preferredDate, setPreferredDate] = useState('')
  const [message, setMessage] = useState('')
  const [legalTermsAccepted, setLegalTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const [quote, setQuote] = useState(() => calculateClientQuote({
    serviceType, canton, postalCode, surfaceArea, bathrooms, windowArea, terraceArea,
    includeOven, includeFridge, includeWindows, includeTerrace, details,
  }))

  useEffect(() => {
    setQuote(calculateClientQuote({
        serviceType, canton, postalCode, surfaceArea, bathrooms, windowArea, terraceArea,
        includeOven, includeFridge, includeWindows, includeTerrace, details,
      }))
    }, [serviceType, canton, postalCode, surfaceArea, bathrooms, windowArea, terraceArea, includeOven, includeFridge, includeWindows, includeTerrace, details])
  const hasMountainAirbnbPricing = serviceType === 'airbnb' && isMountainClientPostalCode(postalCode)
  const minDate = new Date(Date.now() + 86400000).toLocaleDateString('en-CA')
  const chosenExtras = [
    includeOven && t.oven,
    includeFridge && t.fridge,
    includeWindows && t.windows,
    includeTerrace && t.terrace,
  ].filter(Boolean) as string[]
  const submitQuoteLabel = locale === 'fr' ? 'Demander mon devis immédiat' : locale === 'en' ? 'Request my quote now' : 'Solicitar mi presupuesto ahora'

  async function analyzeQuoteDescription() {
    const description = aiDescription.trim()
    if (description.length < 12) {
      setAiError(assistantCopy[locale].tooShort)
      return
    }

    setAiLoading(true)
    setAiError('')
    try {
      const response = await fetch('/api/quote-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, locale }),
      })
      if (!response.ok) throw new Error('Quote analysis failed')
      const result = (await response.json()) as QuoteAssistantResponse
      const inventory = result.inventory

      if (result.area !== null) setSurfaceArea(result.area)
      if (inventory.bathrooms !== null && inventory.bathrooms > 0) setBathrooms(inventory.bathrooms)
      setDetails((current) => ({
        ...current,
        ...(result.property === 'apartment' && { propertyType: 'apartment' as const }),
        ...(result.property === 'studio' && { propertyType: 'studio' as const }),
        ...(result.property === 'house' && { propertyType: 'house' as const }),
        ...(result.property === 'farm' && { propertyType: 'farm' as const }),
        ...(result.property === 'airbnb' && { propertyType: 'airbnb' as const }),
        ...(['office', 'clinic', 'concierge'].includes(result.property ?? '') && { propertyType: 'office' as const }),
        ...(result.property === 'shop' && { propertyType: 'shop' as const }),
        ...(inventory.bedrooms !== null && { bedrooms: inventory.bedrooms }),
        ...(inventory.kitchens !== null && { kitchens: inventory.kitchens }),
        ...(inventory.livingRooms !== null && { livingRooms: inventory.livingRooms }),
        ...(inventory.offices !== null && { offices: inventory.offices }),
        ...(inventory.tables !== null && { tables: inventory.tables }),
        ...(inventory.desks !== null && { desks: inventory.desks }),
        ...(inventory.vitrines !== null && { vitrines: inventory.vitrines }),
        ...(inventory.windows !== null && { windows: inventory.windows }),
        ...(inventory.wallArea !== null && { wallArea: inventory.wallArea }),
        cleanWalls: current.cleanWalls || inventory.cleanWalls,
        postConstructionDust: current.postConstructionDust || inventory.postConstructionDust || result.serviceType === 'postConstruction',
        paintMarks: current.paintMarks || inventory.paintMarks,
      }))

      if (inventory.windowArea !== null) setWindowArea(inventory.windowArea)
      if (inventory.terraceArea !== null) setTerraceArea(inventory.terraceArea)
      if (result.extras.includes('oven')) setIncludeOven(true)
      if (result.extras.includes('fridge')) setIncludeFridge(true)
      if (result.extras.includes('windows')) setIncludeWindows(true)
      if (result.extras.includes('terrace')) setIncludeTerrace(true)

      if (result.serviceType === 'endOfTenancy') setServiceType('fin_de_bail')
      else if (result.serviceType === 'postConstruction') setServiceType('fin_travaux')
      else if (result.property === 'airbnb') setServiceType('airbnb')
      else if (result.property === 'clinic') setServiceType('cabinet_medical')
      else if (result.property === 'concierge') setServiceType('conciergerie')
      else if (result.property === 'office') setServiceType('bureaux')

      setAiResult({ summary: result.summary, question: result.question, source: result.source })
    } catch {
      setAiError(assistantCopy[locale].error)
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    const formData = new FormData(event.currentTarget)
    try {
      const result = await submitClientServiceRequest(formData)
      if (!result.ok) {
        const localizedError = result.error.includes('Inicia sesión') ? t.loginError : result.error.includes('cuenta') ? t.accountError : result.error.includes('Revisa') ? t.validationError : result.error.includes('fecha') ? t.dateError : t.submitError
        setFeedback({ kind: 'error', text: localizedError })
        return
      }
      setFeedback({ kind: 'success', text: t.success })
      setMessage('')
      setLegalTermsAccepted(false)
      setPreferredDate('')
      setDetails(emptyClientQuoteDetails)
      setWindowArea(0)
      setTerraceArea(0)
      setIncludeOven(false)
      setIncludeFridge(false)
      setIncludeWindows(false)
      setIncludeTerrace(false)
      router.refresh()
    } catch {
      setFeedback({ kind: 'error', text: t.networkError })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="client-services" aria-labelledby="client-services-title">
      <div className="client-services-intro">
        <div>
          <p className="auth-eyebrow">{t.eyebrow}</p>
          <h2 id="client-services-title">{t.title}</h2>
          <p>{t.intro}</p>
          <p className="client-services-trust">{t.trustNote}</p>
        </div>
        <span className="client-section-mark"><Sparkles aria-hidden="true" /></span>
      </div>

      {!isDeletionPending && (
        <section className="client-material-guide" aria-labelledby="client-material-guide-title">
          <div className="client-material-guide-heading">
            <div>
              <p className="auth-eyebrow">{locale === 'fr' ? 'CONSEILS D’ENTRETIEN' : locale === 'en' ? 'CARE GUIDE' : 'GUÍA DE CUIDADO'}</p>
              <h3 id="client-material-guide-title">{materialGuide.title}</h3>
              <p>{materialGuide.intro}</p>
            </div>
          </div>
          <div className="client-material-grid">
            {materialTypes.map((materialType) => {
              const material = materialGuide.materials[materialType]
              const selected = selectedMaterial === materialType
              return (
                <button
                  key={materialType}
                  type="button"
                  className={`client-material-card${selected ? ' client-material-card-selected' : ''}`}
                  aria-pressed={selected}
                  aria-controls="client-material-advice"
                  onClick={() => setSelectedMaterial(selected ? null : materialType)}
                >
                  <span className="client-material-image">
                    <Image src={materialImages[materialType]} alt={material.name} fill sizes="(min-width: 1200px) 16vw, (min-width: 700px) 30vw, 45vw" />
                  </span>
                  <span className="client-material-card-copy">
                    <strong>{material.name}</strong>
                    <span>{materialGuide.select}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <div id="client-material-advice" className="client-material-advice" hidden={!selectedMaterial} aria-live="polite">
            {selectedMaterial && (() => {
              const material = materialGuide.materials[selectedMaterial]
              return (
                <div className="client-material-advice-content">
                  <div className="client-material-advice-topline">
                    <h4>{material.name}</h4>
                    <span>{locale === 'fr' ? 'CONSEIL PROFESSIONNEL' : locale === 'en' ? 'PRO TIP' : 'CONSEJO PROFESIONAL'}</span>
                  </div>
                  <div className="client-material-advice-columns">
                    <p><strong>{materialGuide.productLabel}</strong>{material.product}</p>
                    <p><strong>{materialGuide.methodLabel}</strong>{material.method}</p>
                  </div>
                  <p className="client-material-safety-note">{materialGuide.note}</p>
                </div>
              )
            })()}
          </div>
        </section>
      )}

      <div className={`client-tabs${isDeletionPending ? ' client-tabs-pending' : ''}`} role="tablist" aria-label={workflow.tabsLabel}>
        {!isDeletionPending && (
          <>
            <button
              id="client-booking-tab"
              className="client-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'booking'}
              aria-controls="client-booking-panel"
              tabIndex={activeTab === 'booking' ? 0 : -1}
              onClick={() => setActiveTab('booking')}
              onKeyDown={handleTabKeyDown}
            >
              <CalendarDays aria-hidden="true" />
              <span>{workflow.booking}</span>
            </button>
            <button
              id="client-activity-tab"
              className="client-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'activity'}
              aria-controls="client-activity"
              tabIndex={activeTab === 'activity' ? 0 : -1}
              onClick={() => setActiveTab('activity')}
              onKeyDown={handleTabKeyDown}
            >
              <BriefcaseBusiness aria-hidden="true" />
              <span>{t.myRequests}</span>
            </button>
            <button
              id="client-explanation-tab"
              className="client-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'explanation'}
              aria-controls="client-explanation-panel"
              tabIndex={activeTab === 'explanation' ? 0 : -1}
              onClick={() => setActiveTab('explanation')}
              onKeyDown={handleTabKeyDown}
            >
              <ClipboardList aria-hidden="true" />
              <span>{workflow.explanation}</span>
            </button>
          </>
        )}
        <button
          id="client-trust-tab"
          className="client-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'trust'}
          aria-controls="client-trust"
          tabIndex={activeTab === 'trust' ? 0 : -1}
          onClick={() => setActiveTab('trust')}
          onKeyDown={handleTabKeyDown}
        >
          <ShieldCheck aria-hidden="true" />
          <span>{trust.tab}</span>
        </button>
      </div>

      <div
        id="client-explanation-panel"
        className="client-tab-panel client-explanation-panel"
        role="tabpanel"
        aria-labelledby="client-explanation-tab"
        tabIndex={0}
        hidden={activeTab !== 'explanation'}
      >
        <h3>{workflow.heading}</h3>
        <div className="client-detail-layout">
          <nav className="client-side-menu" aria-label={workflow.explanation}>
            {workflow.steps.map((step, index) => (
              <button key={step.title} type="button" className="client-side-menu-item" aria-current={activeStep === index ? 'step' : undefined} onClick={() => setActiveStep(index)}>
                <span className="client-side-menu-number">{String(index + 1).padStart(2, '0')}</span>
                <span>{step.title}</span>
              </button>
            ))}
          </nav>
          <div className="client-detail-content" aria-live="polite">
            {(() => {
              const step = workflow.steps[activeStep]
              const StepIcon = activeStep === 0 ? ClipboardList : activeStep === 1 ? Users : Heart
              return <article className="client-detail-card"><span className="client-process-icon"><StepIcon aria-hidden="true" /></span><h4>{step.title}</h4><p>{step.description}</p></article>
            })()}
          </div>
        </div>
        <button
          className="auth-submit client-explanation-cta"
          type="button"
          onClick={() => {
            setActiveTab('booking')
            requestAnimationFrame(() => document.getElementById('client-booking-panel')?.focus())
          }}
        >
          {workflow.start}<ArrowUpRight aria-hidden="true" />
        </button>
      </div>

      <section
        id="client-trust"
        className="client-tab-panel client-trust-panel"
        role="tabpanel"
        aria-labelledby="client-trust-tab"
        tabIndex={0}
        hidden={activeTab !== 'trust'}
      >
        <h3>{trust.heading}</h3>
        <div className="client-detail-layout">
          <nav className="client-side-menu" aria-label={trust.tab}>
            {trust.cards.map((card, index) => (
              <button key={card.title} type="button" className="client-side-menu-item" aria-current={activeTrustCard === index ? 'step' : undefined} onClick={() => setActiveTrustCard(index)}>
                <span className="client-side-menu-number">{String(index + 1).padStart(2, '0')}</span>
                <span>{card.title}</span>
              </button>
            ))}
          </nav>
          <div className="client-detail-content" aria-live="polite">
            {(() => {
              const card = trust.cards[activeTrustCard]
              const TrustIcon = activeTrustCard === 0 ? BriefcaseBusiness : activeTrustCard === 1 ? ShieldCheck : BadgeCheck
              return <article className="client-detail-card"><span className="client-trust-icon"><TrustIcon aria-hidden="true" /></span><h4>{card.title}</h4><p>{card.description}</p></article>
            })()}
            {securityContent}
          </div>
        </div>
        <ClientDashboardPromo locale={locale} />
      </section>

      <div
        id="client-booking-panel"
        className="client-tab-panel"
        role="tabpanel"
        aria-labelledby="client-booking-tab"
        tabIndex={0}
        hidden={isDeletionPending || activeTab !== 'booking'}
      >
      <form id="client-new-quote" className="client-request-form" onSubmit={handleSubmit}>
        <nav className="client-side-menu client-booking-menu" aria-label={bookingMenuTitle}>
          <strong className="client-side-menu-heading">{bookingMenuTitle}</strong>
          {bookingMenuItems.map((item, index) => (
            <button key={item.id} type="button" className="client-side-menu-item" aria-current={activeBookingSection === item.id ? 'step' : undefined} onClick={() => focusBookingSection(item.id, item.target)}>
              <span className="client-side-menu-number">{String(index + 1).padStart(2, '0')}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="client-form-main">
          <section id="client-booking-ai" className="client-form-block" aria-labelledby="client-ai-heading" tabIndex={-1}>
            <div className="client-block-title"><span className="client-step-marker"><Sparkles aria-hidden="true" /></span><span><strong id="client-ai-heading">{assistantCopy[locale].title}</strong><small>{assistantCopy[locale].hint}</small></span></div>
            <label className="field-label" htmlFor="client-ai-description">
              {locale === 'fr' ? 'Description du nettoyage' : locale === 'en' ? 'Cleaning description' : 'Descripción de la limpieza'}
              <textarea id="client-ai-description" rows={3} maxLength={1200} value={aiDescription} onChange={(event) => setAiDescription(event.target.value)} placeholder={assistantCopy[locale].placeholder} />
            </label>
            <button className="auth-submit client-ai-submit" type="button" onClick={analyzeQuoteDescription} disabled={aiLoading}>
              {aiLoading ? <>{assistantCopy[locale].analyzing} <Clock3 aria-hidden="true" /></> : <>{assistantCopy[locale].analyze} <Sparkles aria-hidden="true" /></>}
            </button>
            {aiError && <p className="client-feedback client-feedback-error" role="alert">{aiError}</p>}
            {aiResult && <p className="client-feedback client-feedback-success" role="status"><strong>{aiResult.source === 'ai' ? assistantCopy[locale].understood : assistantCopy[locale].fallback}:</strong> {aiResult.summary}{aiResult.question && <> · {assistantCopy[locale].followUp}: {aiResult.question}</>}</p>}
          </section>

          <fieldset id="client-booking-service" className="client-service-picker" tabIndex={-1}>
            <legend><span className="client-step-marker">1</span><span><strong>{t.choose}</strong><small>{t.chooseHint}</small></span></legend>
            <div className="client-service-grid">
              {serviceTypes.map(([value]) => {
                const Icon = serviceIcons[value]
                const selected = serviceType === value
                return (
                  <label className={`client-service-option${selected ? ' client-service-option-selected' : ''}`} key={value}>
                    <input
                      className="sr-only"
                      type="radio"
                      name="serviceType"
                      value={value}
                      checked={selected}
                      onChange={() => {
                        setServiceType(value)
                        if (value === 'fin_travaux') updateDetail('postConstructionDust', true)
                      }}
                    />
                    <span className="client-service-icon"><Icon aria-hidden="true" /></span>
                    <span className="client-service-copy">
                      <strong>{serviceLabels[value]}</strong>
                      <span>{serviceDescriptions[value].description}</span>
                      <small>{serviceDescriptions[value].context}</small>
                    </span>
                    <span className="client-service-check" aria-hidden="true">{selected && <Check />}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <section id="client-booking-space" className="client-form-block" aria-labelledby="client-space-heading" tabIndex={-1}>
            <div className="client-block-title"><span className="client-step-marker">2</span><span><strong id="client-space-heading">{t.space}</strong><small>{t.spaceHint}</small></span></div>
            <div className="client-form-grid client-property-grid">
              <label className="field-label">{inventory.propertyType}
                <select name="propertyType" value={details.propertyType} onChange={(event) => updateDetail('propertyType', event.target.value as ClientPropertyType)}>
                  {propertyTypeOptions.map((type) => <option key={type} value={type}>{inventory[type]}</option>)}
                </select>
              </label>
              <label className="field-label">{t.canton}
                <select name="canton" value={canton} onChange={(event) => setCanton(event.target.value as ClientCanton)}>
                  {cantonOptions.map((option) => <option key={option.code} value={option.code}>{cantonNames[option.code][locale]}</option>)}
                </select>
              </label>
              <label className="field-label">{t.surface}
                <input name="surfaceArea" type="number" min="1" max="1000" required value={surfaceArea} onChange={(event) => setSurfaceArea(Math.min(1000, Math.max(1, Number(event.target.value) || 1)))} />
              </label>
              <label className="field-label">{pricingLabels.bathrooms}
                <input name="bathrooms" type="number" min="1" max="20" required value={bathrooms} onChange={(event) => setBathrooms(Math.min(20, Math.max(1, Number(event.target.value) || 1)))} />
              </label>
            </div>
          </section>

          <section id="client-booking-contact" className="client-form-block" aria-labelledby="client-contact-heading" tabIndex={-1}>
            <div className="client-block-title"><span className="client-step-marker">3</span><span><strong id="client-contact-heading">{inventory.client}</strong><small>{customer.name}</small></span></div>
            <div className="client-form-grid client-property-grid client-contact-grid">
              <div className="field-label"><span>{inventory.email}</span><strong>{customer.email}</strong></div>
              <div className="field-label"><span>{inventory.phone}</span><strong>{customer.phone}</strong></div>
              <div className="field-label"><span>{inventory.customerAddress}</span><strong>{customer.address}</strong></div>
              <label className="field-label">{pricingLabels.postalCode}
                <input name="postalCode" type="text" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{4}" maxLength={4} required value={postalCode} onChange={(event) => {
                  const nextPostalCode = event.target.value.replace(/[^0-9]/g, '').slice(0, 4)
                  setPostalCode(nextPostalCode)
                  const nextCanton = getClientPostalCanton(nextPostalCode)
                  if (nextCanton) setCanton(nextCanton)
                }} />
              </label>
              {customer.companyName && <div className="field-label"><span>{locale === 'fr' ? 'Entreprise' : locale === 'en' ? 'Company' : 'Empresa'}</span><strong>{customer.companyName}</strong></div>}
            </div>
          </section>

          <section id="client-booking-logistics" className="client-form-block" aria-labelledby="client-logistics-heading" tabIndex={-1}>
            <div className="client-block-title"><span className="client-step-marker">4</span><span><strong id="client-logistics-heading">{locale === 'fr' ? 'Accès et logistique' : locale === 'en' ? 'Access and logistics' : 'Acceso y logística'}</strong><small>{locale === 'fr' ? 'Précisez les conditions d’accès au logement.' : locale === 'en' ? 'Tell us how the team can access the property.' : 'Indica cómo podrá acceder el equipo a la propiedad.'}</small></span></div>
            <fieldset className="client-extras">
              <legend className="sr-only">{locale === 'fr' ? 'Informations d’accès' : locale === 'en' ? 'Access details' : 'Datos de acceso'}</legend>
              <div className="client-extras-grid">
                <label className={details.parkingAvailable ? 'client-extra-selected' : ''}><input type="checkbox" name="parkingAvailable" checked={details.parkingAvailable ?? false} onChange={(event) => updateDetail('parkingAvailable', event.target.checked)} /><span><strong>{locale === 'fr' ? 'Parking disponible' : locale === 'en' ? 'Parking available' : 'Parking disponible'}</strong></span></label>
                <label className={details.keyHandover ? 'client-extra-selected' : ''}><input type="checkbox" name="keyHandover" checked={details.keyHandover ?? false} onChange={(event) => updateDetail('keyHandover', event.target.checked)} /><span><strong>{locale === 'fr' ? 'Remise des clés à prévoir' : locale === 'en' ? 'Key handover needed' : 'Se deben entregar las llaves'}</strong></span></label>
              </div>
            </fieldset>
            <label className="field-label client-message-label">{locale === 'fr' ? 'Commentaires' : locale === 'en' ? 'Comments' : 'Comentarios'} <span className="optional-label">{t.optional}</span>
              <textarea name="message" rows={3} maxLength={1000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={locale === 'fr' ? 'Digicode, accès, instructions utiles…' : locale === 'en' ? 'Entry code, access, helpful instructions…' : 'Código de acceso, instrucciones útiles…'} />
            </label>
          </section>

          <section id="client-booking-extras" className="client-form-block" aria-labelledby="client-extras-heading" tabIndex={-1}>
            <div className="client-block-title"><span className="client-step-marker">5</span><span><strong id="client-extras-heading">{t.extrasTitle}</strong><small>{t.extrasHint}</small></span></div>
            <fieldset className="client-extras">
              <legend className="sr-only">{t.extrasLegend}</legend>
              <div className="client-extras-grid">
                <label className={includeOven ? 'client-extra-selected' : ''}><input type="checkbox" name="includeOven" checked={includeOven} onChange={(event) => setIncludeOven(event.target.checked)} /><span><strong>{t.oven}</strong><small>+ CHF {EXTRA_PRICES.four}</small></span></label>
                <label className={includeFridge ? 'client-extra-selected' : ''}><input type="checkbox" name="includeFridge" checked={includeFridge} onChange={(event) => setIncludeFridge(event.target.checked)} /><span><strong>{t.fridge}</strong><small>+ CHF {EXTRA_PRICES.frigo}</small></span></label>
                <label className={includeWindows ? 'client-extra-selected' : ''}><input type="checkbox" name="includeWindows" checked={includeWindows} onChange={(event) => setIncludeWindows(event.target.checked)} /><span><strong>{t.windows}</strong><small>CHF {EXTRA_PRICES.fenetre} / m²</small></span></label>
                <label className={includeTerrace ? 'client-extra-selected' : ''}><input type="checkbox" name="includeTerrace" checked={includeTerrace} onChange={(event) => setIncludeTerrace(event.target.checked)} /><span><strong>{t.terrace}</strong><small>CHF {EXTRA_PRICES.terrasse} / m²</small></span></label>
              </div>
              {includeWindows && <label className="field-label">{inventory.windowsArea}
                <input name="windowArea" type="number" min="1" max="1000" required value={windowArea} onChange={(event) => setWindowArea(Math.min(1000, Math.max(0, Number(event.target.value) || 0)))} />
              </label>}
              {includeTerrace && <label className="field-label">{inventory.terraceArea}
                <input name="terraceArea" type="number" min="1" max="1000" required value={terraceArea} onChange={(event) => setTerraceArea(Math.min(1000, Math.max(0, Number(event.target.value) || 0)))} />
              </label>}
            </fieldset>
          </section>

          <section id="client-booking-timing" className="client-form-block" aria-labelledby="client-timing-heading" tabIndex={-1}>
            <div className="client-block-title"><span className="client-step-marker">6</span><span><strong id="client-timing-heading">{t.timing}</strong><small>{t.timingHint}</small></span></div>
            <div className="client-timing-fields">
              <label className="field-label">{t.preferredDate} <span className="optional-label">{t.optional}</span>
                <input className="client-date-input" name="preferredDate" type="date" min={minDate} value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} />
              </label>
            </div>
          </section>
        </div>

        <aside className="client-quote-card" aria-live="polite" aria-label={t.estimate}>
          <span className="client-quote-eyebrow">{t.estimate}</span>
          <strong className="client-quote-price">{money(quote.total, locale)}</strong>
          <span className="client-quote-note">{t.confirmAfter}</span>
          {hasMountainAirbnbPricing && <p className="client-quote-note" role="status">{pricingLabels.mountain}</p>}
          <dl className="client-pricing-breakdown">
            <div><dt>{pricingLabels.hours}</dt><dd>{quote.hours} h · {quote.crewSize} {quote.crewSize === 1 ? t.professional : t.professionals}</dd></div>
            <div><dt>{inventory.lineBase}</dt><dd>{money(quote.baseFlatFee, locale)}</dd></div>
            <div><dt>{inventory.lineLabor}</dt><dd>{money(quote.laborCost, locale)}</dd></div>
            {quote.breakdownExtras.map((extra) => <div key={extra.id}><dt>{extra.id === 'walls' ? inventory.lineWalls : extra.id === 'postConstructionDust' ? inventory.lineDust : extra.id === 'paintMarks' ? inventory.linePaint : extra.id === 'windows' ? inventory.lineWindows : extra.id === 'terrace' ? inventory.lineTerrace : extra.id === 'oven' ? t.oven : t.fridge}</dt><dd>{money(extra.cost, locale)}</dd></div>)}
            <div><dt>{pricingLabels.net}</dt><dd>{money(quote.netSubtotal, locale)}</dd></div>
            <div><dt>{pricingLabels.vat}</dt><dd>{money(quote.vatAmount, locale)}</dd></div>
          </dl>
          <div className="client-quote-summary">
            <div><span>{t.service}</span><strong>{serviceLabels[serviceType]}</strong></div>
            <div><span>{t.zone}</span><strong><MapPin aria-hidden="true" />{cantonNames[canton][locale]} · {surfaceArea} m²</strong></div>
            <div><span>{t.time}</span><strong><Clock3 aria-hidden="true" />{quote.hours} h · {quote.crewSize} {quote.crewSize === 1 ? t.professional : t.professionals}</strong></div>
            <div><span>{inventory.propertyType}</span><strong>{inventory[details.propertyType]} · {details.bedrooms} {inventory.bedrooms.toLowerCase()} · {details.kitchens} {inventory.kitchens.toLowerCase()} · {bathrooms} {inventory.bathrooms.toLowerCase()}</strong></div>
            {(details.vitrines > 0 || details.desks > 0 || details.tables > 0 || details.windows > 0) && <div className="client-summary-extras"><span>{inventory.inventory}</span><strong>{details.vitrines} {inventory.vitrines.toLowerCase()} · {details.desks} {inventory.desks.toLowerCase()} · {details.tables} {inventory.tables.toLowerCase()} · {details.windows} {inventory.windows.toLowerCase()}</strong></div>}
            {chosenExtras.length > 0 && <div className="client-summary-extras"><span>{t.extras}</span><strong>{chosenExtras.join(' · ')}</strong></div>}
          </div>
          <div className="client-quote-reassurance"><ShieldCheck aria-hidden="true" /><span>{t.reassurance}</span></div>
          <label className="client-legal-consent">
            <input name="termsAccepted" type="checkbox" required checked={legalTermsAccepted} onChange={(event) => setLegalTermsAccepted(event.target.checked)} />
            <span>
              {locale === 'fr' ? 'J’accepte les ' : locale === 'en' ? 'I accept the ' : 'Acepto los '}
              <a href="/terms" target="_blank" rel="noreferrer">{locale === 'fr' ? 'Conditions Générales' : locale === 'en' ? 'Terms and Conditions' : 'Términos y condiciones'}</a>
              {locale === 'fr' ? ' et la ' : locale === 'en' ? ' and the ' : ' y la '}
              <a href="/privacy" target="_blank" rel="noreferrer">{locale === 'fr' ? 'Politique de Confidentialité' : locale === 'en' ? 'Privacy Policy' : 'Política de privacidad'}</a>
              {locale === 'fr' ? ' de H&S Quality Service.' : locale === 'en' ? ' of H&S Quality Service.' : ' de H&S Quality Service.'}
            </span>
          </label>
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? t.sending : <>{submitQuoteLabel} <ArrowUpRight aria-hidden="true" /></>}
          </button>
          <p className="client-quote-disclaimer">{t.disclaimer}</p>
        </aside>
        {feedback && <p className={`client-feedback client-feedback-${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'}>{feedback.kind === 'success' && <Check aria-hidden="true" />}{feedback.text}</p>}
      </form>
      </div>

      <section
        id="client-activity"
        className="client-tab-panel client-history-panel"
        role="tabpanel"
        aria-labelledby="client-activity-tab"
        tabIndex={0}
        hidden={isDeletionPending || activeTab !== 'activity'}
      >
        <div className="client-history-heading">
          <div><p className="auth-eyebrow">{t.activity}</p><h2>{t.myRequests}</h2><p>{t.activityHint}</p></div>
          <span className="client-history-count">{requests.length} {requests.length === 1 ? t.request : t.requests}</span>
        </div>
        {requests.length === 0 ? (
          <div className="client-history-empty"><House aria-hidden="true" /><strong>{t.empty}</strong><span>{t.emptyHint}</span></div>
        ) : (
          <div className="client-request-list">
            {requests.map((request) => <article className="client-request-card" key={request.id}>
              <div className="client-request-icon"><House aria-hidden="true" /></div>
              <div className="client-request-copy">
                <div className="client-request-title"><h3>{serviceLabels[request.serviceType]}</h3><span className={`client-request-status status-${request.status}`}>{statusLabels[request.status]}</span></div>
                <p>{request.surfaceArea} m² · {request.bathrooms} {pricingLabels.bathrooms.toLocaleLowerCase()} · {request.postalCode ?? cantonNames[request.canton][locale] ?? request.canton}</p>
                <small>{inventory[request.quoteDetails.propertyType ?? 'apartment']} · {request.quoteDetails.bedrooms ?? 0} {inventory.bedrooms.toLowerCase()} · {request.quoteDetails.kitchens ?? 0} {inventory.kitchens.toLowerCase()} · {request.quoteDetails.vitrines ?? 0} {inventory.vitrines.toLowerCase()} · {request.windowArea ?? 0} m² {inventory.windows.toLowerCase()}</small>
                <small>{request.confirmedDate ? `${adminT.confirmedDate}: ${new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(new Date(`${request.confirmedDate}T12:00:00`))}` : request.preferredDate ? `${t.preferred} ${new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(new Date(`${request.preferredDate}T12:00:00`))}` : `${t.sent} ${new Intl.DateTimeFormat(`${locale}-CH`, { dateStyle: 'medium' }).format(new Date(request.createdAt))}`}</small>
                {request.assignedStaffName && <small>{adminT.assignedStaff}: {request.assignedStaffName}</small>}
                {request.proposal && request.proposal.status !== 'cancelled' && <ClientScheduleAction
                  requestId={request.id}
                  proposalDate={request.proposal.appointmentDate}
                  startTime={request.proposal.startTime}
                  endTime={request.proposal.endTime}
                  proposalStatus={request.proposal.status}
                  locale={locale}
                />}
              </div>
              <strong className="client-request-price">{money(request.confirmedPrice ?? request.estimatedPrice, locale)}</strong>
              {(request.status === 'requested' || request.status === 'reviewing') && <form className="client-request-cancel" action={cancelClientServiceRequest.bind(null, request.id)}><button className="admin-reject-button" type="submit">{adminT.cancel}</button></form>}
            </article>)}
          </div>
        )}
      </section>
    </section>
  )
}
