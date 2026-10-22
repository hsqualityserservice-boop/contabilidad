'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Check, LoaderCircle, Send, Sparkles, Users, X } from 'lucide-react'
import { airbnbPricingForPostalCode, cantonFromPostalCode, createQuoteCalculation, quoteCantons, type QuoteCanton, type QuoteDraft, type QuoteExtra, type QuoteFrequency, type QuotePropertyType, type QuoteServiceType } from '@/lib/quote-pricing'

type Locale = 'es' | 'fr' | 'en'
type LiveQuoteResponse = { success: true; financial: { total: number } }
type KeyedLiveQuote = { key: string; response: LiveQuoteResponse }
type QuoteDetails = { property: QuotePropertyType | 'studio' | 'farm' | null; serviceType: QuoteServiceType | null; area: number | null; postalCode: string | null; frequency: QuoteFrequency | null; extras: QuoteExtra[]; inventory: { bathrooms: number | null }; summary: string; question: string | null; source: 'ai' | 'fallback' }

const copy = {
  es: {
    kicker: 'ESTIMACIÓN INTELIGENTE', title: 'Asistente de presupuesto', hint: 'Cuéntanos lo esencial una vez; solo preguntaremos lo que falte para afinar el precio.', panelHint: 'Escribe el tipo de espacio, metros aproximados, baños y NPA. Añade tareas especiales si las hay.', propertyDetails: 'Datos del espacio y servicio', contactDetails: 'Datos de contacto', addDetails: 'Completa solo los datos que faltan', continueAnalysis: 'Continuar cálculo', initialAnalyze: 'Calcular estimación', followUpPlaceholder: 'Añade aquí solo la información que falta…', contactRequired: 'Introduce un correo electrónico válido y un teléfono para crear el presupuesto.', phone: 'Teléfono', methodLabel: 'Cómo quieres completar los datos', quickMethod: 'Selección rápida', aiMethod: 'Asistencia IA', optionalDetails: 'Opciones y descripción',
    property: 'Tipo de propiedad', apartment: 'Apartamento', house: 'Casa', airbnb: 'Alquiler turístico (Airbnb)', office: 'Oficina', shop: 'Boutique o tienda', clinic: 'Clínica o consultorio', concierge: 'Conserjería', terrace: 'Terraza', serviceType: 'Tipo de servicio', standard: 'Limpieza de mantenimiento', endOfTenancy: 'Fin de contrato / mudanza', postConstruction: 'Limpieza tras obras', teamRecommendation: 'Equipo recomendado', cleanerSingular: 'persona', cleanerPlural: 'personas', onSiteDuration: 'en el lugar', laborHours: 'horas-persona', clinicNotice: 'Limpieza de superficies y zonas comunes; no incluye esterilización ni equipamiento médico.', endOfTenancyNotice: 'Incluye el recargo estimado de fin de contrato; revisa el inventario y las condiciones de entrega antes de confirmar el precio.', area: 'Superficie', bathrooms: 'Baños',
    location: 'Cantón', postal: 'NPA (Código postal)', describe: 'Describe el trabajo con tus palabras', placeholder: 'Ej.: Apartamento de 90 m², 2 baños, NPA 1200; fin de contrato, horno y ventanas.',
    analyze: 'Interpretar con IA', analyzing: 'Analizando…', assistTitle: 'La IA ha entendido', extras: 'Tareas adicionales', windows: 'Ventanas', oven: 'Horno', fridge: 'Nevera', deep: 'Limpieza a fondo',
    customerPrivate: 'Particular', customerPro: 'Empresa / inmobiliaria', aiOptional: 'Rellenar con IA (opcional)', npaRequired: 'Introduce un NPA válido para calcular', cantonAuto: 'Detectado automáticamente', cantonManual: 'Seleccionar cantón', frequency: 'Frecuencia', oneTime: 'Una vez', weekly: 'Semanal', biweekly: 'Cada 2 semanas', monthly: 'Mensual', estimated: 'Precio estimado', hourly: 'Tarifa local', perVisit: 'por visita',
    name: 'Nombre del cliente', email: 'Correo electrónico', create: 'Crear presupuesto', cancel: 'Cancelar', success: 'Presupuesto listo para enviar', send: 'Enviar por correo', subject: 'Tu presupuesto de limpieza', hello: 'Hola', intro: 'Esta es la estimación orientativa para la limpieza', team: 'Equipo recomendado', onSite: 'horas en el lugar', endOfTenancyLine: 'Servicio de fin de contrato', signoff: 'Un saludo', brand: 'HS Cleaning',
    calculating: 'Actualizando precio…', updated: 'Precio actualizado', disclaimer: 'Tarifa fija por visita más mano de obra. El total incluye IVA suizo del 8,1 % y se redondea al múltiplo de CHF 0,05 más cercano; no incluye desplazamiento ni materiales. Desplazamiento y materiales no incluidos; confirma el importe final antes de aceptar.', postalHint: 'El código postal determina la tarifa horaria; si no se reconoce, elige el cantón manualmente.', unknownPostal: 'Código no reconocido: elige manualmente uno de los cantones disponibles.', selectCanton: 'Elige el cantón para calcular el presupuesto.', includeCanton: 'Añade el cantón en el texto para ubicar esta dirección.', waitingForDetails: 'Introduce un NPA de cuatro cifras y el precio se calculará automáticamente.', manualCanton: 'Cantón elegido manualmente', baseFee: 'Tarifa fija por visita', laborTotal: 'Coste de horas estimadas', netSubtotal: 'Subtotal neto tras descuento', mountainSupplement: 'Suplemento alpino', frequencyDiscount: 'Descuento por frecuencia', vat: 'IVA suizo 8,1 %', aiError: 'No se pudo analizar el texto. Revisa la descripción e inténtalo de nuevo.', required: 'Escribe al menos 12 caracteres para que la IA pueda interpretar el trabajo.', fallbackTitle: 'Interpretación automática', fallbackNotice: 'El modelo de IA no está disponible; se ha usado una lectura local del texto.', duration: 'Duración estimada', estimateIndicative: 'TU ESTIMACIÓN ORIENTATIVA', serviceDetailsTitle: 'Servicios incluidos', priceBreakdown: 'Ver desglose del precio', tariffRegion: 'Tarifa regional', estimatedHoursLabel: 'Horas estimadas', netPriceLabel: 'Precio neto', totalLabel: 'Total en CHF', mountainRateNotice: 'Tarification Station de Montagne activée (Logistique incluse)', rateFormula: 'Precio = horas × tarifa + tarifa fija + extras · Horas = techo(superficie × 0,05 + baños × 0,5), mínimo 1 h', airbnbDisclaimer: 'La tarifa premium de montaña ya está incluida en el forfait y en la tarifa horaria Airbnb. El total incluye IVA suizo del 8,1 %; desplazamiento y materiales no incluidos. Confirma el importe final antes de aceptar.', postalRequired: 'Introduce un NPA válido de cuatro cifras.', airbnbScope: 'Inclus : Blanchisserie complète (draps et serviettes), réassort des consommables, rapport photo obligatoire après chaque nettoyage et check-in/out des clés.', regularScope: 'Inclus : Dépoussiérage complet, aspiration et lavage des sols, nettoyage sanitaire en profondeur, désinfection des surfaces de cuisine.', professionalScope: 'Inclus : Désinfection aux normes de santé (HUG), entretien des postes de travail, gestion des déchets, vitrines de plain-pied, traitement adapté des sols (parquet, linoléum, moquette) et respect HACCP pour la restauration.', conciergeScope: 'Inclus : Nettoyage des communs, gestion des containers à poubelles, entretien de la buanderie commune et déneigement hivernal.',
  },
  fr: {
    kicker: 'ESTIMATION INTELLIGENTE', title: 'Assistant de devis', hint: 'Décrivez l’essentiel une fois ; nous demanderons uniquement les informations manquantes pour affiner le prix.', panelHint: 'Indiquez le lieu, la surface, les salles de bains et le NPA. Ajoutez les prestations particulières si besoin.', propertyDetails: 'Lieu et prestation', contactDetails: 'Coordonnées', addDetails: 'Complétez uniquement les informations manquantes', continueAnalysis: 'Continuer le calcul', initialAnalyze: 'Calculer l’estimation', followUpPlaceholder: 'Ajoutez ici uniquement les informations manquantes…', contactRequired: 'Saisissez une adresse e-mail valide et un numéro de téléphone pour créer le devis.', phone: 'Téléphone', methodLabel: 'Comment souhaitez-vous renseigner les détails ?', quickMethod: 'Choix rapide', aiMethod: 'Assistance IA', optionalDetails: 'Options et description',
    property: 'Type de logement', apartment: 'Appartement', house: 'Maison', airbnb: 'Location touristique (Airbnb)', office: 'Bureau', shop: 'Boutique / commerce', clinic: 'Clinique / cabinet', concierge: 'Conciergerie', terrace: 'Terrasse', serviceType: 'Type de prestation', standard: 'Entretien régulier', endOfTenancy: 'Fin de bail / déménagement', postConstruction: 'Nettoyage après travaux', teamRecommendation: 'Équipe recommandée', cleanerSingular: 'personne', cleanerPlural: 'personnes', onSiteDuration: 'sur place', laborHours: 'heures-personne', clinicNotice: 'Nettoyage des surfaces et espaces communs ; stérilisation et matériel médical exclus.', endOfTenancyNotice: 'Le supplément de fin de bail est estimé ; vérifiez l’inventaire et les exigences de restitution avant de confirmer le prix.', area: 'Surface', bathrooms: 'Salles de bains',
    location: 'Canton', postal: 'NPA (Code postal)', describe: 'Décrivez la prestation avec vos mots', placeholder: 'Ex. : Appartement de 90 m², 2 salles de bains, NPA 1200 ; fin de bail, four et vitres.',
    analyze: 'Analyser avec l’IA', analyzing: 'Analyse…', assistTitle: 'Compréhension de l’IA', extras: 'Prestations supplémentaires', windows: 'Vitres', oven: 'Four', fridge: 'Réfrigérateur', deep: 'Nettoyage en profondeur',
    customerPrivate: 'Particulier', customerPro: 'Entreprise / régie', aiOptional: 'Compléter avec l’IA (facultatif)', npaRequired: 'Saisissez un NPA valide pour calculer', cantonAuto: 'Détecté automatiquement', cantonManual: 'Choisir le canton', frequency: 'Fréquence', oneTime: 'Ponctuelle', weekly: 'Hebdomadaire', biweekly: 'Toutes les 2 semaines', monthly: 'Mensuelle', estimated: 'Prix estimé', hourly: 'Tarif local', perVisit: 'par prestation',
    name: 'Nom du client', email: 'Adresse e-mail', create: 'Créer le devis', cancel: 'Annuler', success: 'Devis prêt à envoyer', send: 'Envoyer par e-mail', subject: 'Votre devis de nettoyage', hello: 'Bonjour', intro: 'Voici l’estimation indicative pour le nettoyage', team: 'Équipe recommandée', onSite: 'heures sur place', endOfTenancyLine: 'Prestation de fin de bail', signoff: 'Cordialement', brand: 'HS Cleaning',
    calculating: 'Mise à jour du prix…', updated: 'Prix mis à jour', disclaimer: 'Forfait par prestation plus main-d’œuvre. Le total inclut la TVA suisse de 8,1 % et est arrondi au multiple de CHF 0,05 le plus proche ; déplacement et matériel exclus. Déplacement et matériel exclus ; confirmez le montant final avant acceptation.', postalHint: 'Le code postal détermine le tarif horaire ; si le canton n’est pas reconnu, choisissez-le manuellement.', unknownPostal: 'Code non reconnu : choisissez manuellement un canton disponible.', selectCanton: 'Choisissez le canton pour calculer le devis.', includeCanton: 'Ajoutez le canton dans le texte pour situer cette adresse.', waitingForDetails: 'Saisissez un NPA à quatre chiffres pour calculer automatiquement le prix.', manualCanton: 'Canton choisi manuellement', baseFee: 'Forfait par prestation', laborTotal: 'Coût des heures estimées', netSubtotal: 'Sous-total net après remise', mountainSupplement: 'Supplément alpin', frequencyDiscount: 'Remise de fréquence', vat: 'TVA suisse 8,1 %', aiError: 'Impossible d’analyser le texte. Vérifiez la description et réessayez.', required: 'Saisissez au moins 12 caractères pour analyser la demande.', fallbackTitle: 'Interprétation automatique', fallbackNotice: 'Le modèle IA n’est pas disponible ; une lecture locale du texte a été utilisée.', duration: 'Durée estimée', estimateIndicative: 'VOTRE ESTIMATION INDICATIVE', serviceDetailsTitle: 'Détail des prestations', priceBreakdown: 'Voir le détail du prix', tariffRegion: 'Tarif régional', estimatedHoursLabel: 'Heures estimées', netPriceLabel: 'Prix net', totalLabel: 'Total en CHF', mountainRateNotice: 'Tarification Station de Montagne activée (Logistique incluse)', rateFormula: 'Prix = heures × tarif + forfait + extras · Heures = plafond(surface × 0,05 + salles de bains × 0,5), minimum 1 h', airbnbDisclaimer: 'La tarification premium de montagne est déjà intégrée au forfait et au tarif horaire Airbnb. Le total inclut la TVA suisse de 8,1 % ; déplacement et matériel exclus. Confirmez le montant final avant acceptation.', postalRequired: 'Saisissez un NPA valide à quatre chiffres.', airbnbScope: 'Inclus : Blanchisserie complète (draps et serviettes), réassort des consommables, rapport photo obligatoire après chaque nettoyage et check-in/out des clés.', regularScope: 'Inclus : Dépoussiérage complet, aspiration et lavage des sols, nettoyage sanitaire en profondeur, désinfection des surfaces de cuisine.', professionalScope: 'Inclus : Désinfection aux normes de santé (HUG), entretien des postes de travail, gestion des déchets, vitrines de plain-pied, traitement adapté des sols (parquet, linoléum, moquette) et respect HACCP pour la restauration.', conciergeScope: 'Inclus : Nettoyage des communs, gestion des containers à poubelles, entretien de la buanderie commune et déneigement hivernal.',
  },
  en: {
    kicker: 'SMART ESTIMATE', title: 'Quote assistant', hint: 'Tell us the essentials once; we’ll only ask for details needed to refine the price.', panelHint: 'Include space type, approximate area, bathrooms, and NPA. Add special tasks if needed.', propertyDetails: 'Property and service details', contactDetails: 'Contact details', addDetails: 'Add only the missing details', continueAnalysis: 'Continue estimate', initialAnalyze: 'Calculate estimate', followUpPlaceholder: 'Add only the missing information here…', contactRequired: 'Enter a valid email address and phone number to create the quote.', phone: 'Phone number', methodLabel: 'How would you like to enter the details?', quickMethod: 'Quick selection', aiMethod: 'AI assistance', optionalDetails: 'Options and description',
    property: 'Property type', apartment: 'Apartment', house: 'House', airbnb: 'Holiday rental (Airbnb)', office: 'Office', shop: 'Shop / boutique', clinic: 'Clinic / practice', concierge: 'Property management', terrace: 'Terrace', serviceType: 'Service type', standard: 'Routine cleaning', endOfTenancy: 'End-of-tenancy / move-out', postConstruction: 'Post-construction cleaning', teamRecommendation: 'Recommended crew', cleanerSingular: 'cleaner', cleanerPlural: 'cleaners', onSiteDuration: 'on site', laborHours: 'labor hours', clinicNotice: 'Surface and shared-area cleaning only; sterilization and medical equipment are excluded.', endOfTenancyNotice: 'The estimated move-out uplift is included; check the inventory and handover requirements before confirming the price.', area: 'Area', bathrooms: 'Bathrooms',
    location: 'Canton', postal: 'NPA (Postal code)', describe: 'Describe the job in your own words', placeholder: 'E.g. 90 m² apartment, 2 bathrooms, NPA 1200; end-of-lease, oven and windows.',
    analyze: 'Interpret with AI', analyzing: 'Analyzing…', assistTitle: 'AI understanding', extras: 'Additional services', windows: 'Windows', oven: 'Oven', fridge: 'Fridge', deep: 'Deep clean',
    customerPrivate: 'Residential', customerPro: 'Business / property manager', aiOptional: 'Fill with AI (optional)', npaRequired: 'Enter a valid postal code to calculate', cantonAuto: 'Detected automatically', cantonManual: 'Choose canton', frequency: 'Frequency', oneTime: 'One-time', weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly', estimated: 'Estimated price', hourly: 'Local rate', perVisit: 'per visit',
    name: 'Client name', email: 'Email address', create: 'Create quote', cancel: 'Cancel', success: 'Quote ready to send', send: 'Send by email', subject: 'Your cleaning quote', hello: 'Hello', intro: 'Here is the indicative estimate for cleaning', team: 'Recommended crew', onSite: 'on-site hours', endOfTenancyLine: 'End-of-tenancy service', signoff: 'Best regards', brand: 'HS Cleaning',
    calculating: 'Updating price…', updated: 'Price updated', disclaimer: 'Per-visit base fee plus labor. The total includes Swiss VAT at 8.1% and is rounded to the nearest CHF 0.05; travel and materials are excluded. Travel and materials are excluded; confirm the final amount before acceptance.', postalHint: 'The postal code determines the hourly rate; if the canton is not recognized, select it manually.', unknownPostal: 'Postal code not recognized: manually choose one of the available cantons.', selectCanton: 'Choose a canton to calculate the quote.', includeCanton: 'Add the canton to the written request to locate this address.', waitingForDetails: 'Enter a four-digit postal code to calculate the estimate automatically.', manualCanton: 'Manually selected canton', baseFee: 'Per-visit base fee', laborTotal: 'Estimated labor hours', netSubtotal: 'Net subtotal after discount', mountainSupplement: 'Mountain supplement', frequencyDiscount: 'Frequency discount', vat: 'Swiss VAT 8.1%', aiError: 'The description could not be analyzed. Review it and try again.', required: 'Enter at least 12 characters to interpret the job.', fallbackTitle: 'Automatic interpretation', fallbackNotice: 'The AI model is unavailable; a local text parser was used instead.', duration: 'Estimated time', estimateIndicative: 'YOUR INDICATIVE ESTIMATE', serviceDetailsTitle: 'Included services', priceBreakdown: 'View price breakdown', tariffRegion: 'Regional rate', estimatedHoursLabel: 'Estimated hours', netPriceLabel: 'Net price', totalLabel: 'Total in CHF', mountainRateNotice: 'Tarification Station de Montagne activée (Logistique incluse)', rateFormula: 'Price = hours × rate + base fee + extras · Hours = ceil(area × 0.05 + bathrooms × 0.5), minimum 1 h', airbnbDisclaimer: 'The premium mountain tariff is already included in the Airbnb base fee and hourly rate. Total includes 8.1% Swiss VAT; travel and materials are excluded. Confirm the final amount before acceptance.', postalRequired: 'Enter a valid four-digit postal code.', airbnbScope: 'Included: complete laundry service (sheets and towels), replenishment of consumables, a required photo report after each clean, and key check-in/out.', regularScope: 'Included: complete dusting, vacuuming and mopping, deep bathroom cleaning, and kitchen-surface disinfection.', professionalScope: 'Included: health-standard disinfection (HUG), workstation care, waste handling, ground-floor shop windows, floor care adapted to parquet, linoleum or carpet, and HACCP compliance for food service.', conciergeScope: 'Included: shared-area cleaning, waste-container management, shared laundry-room care, and winter snow clearing.',
  },
} satisfies Record<Locale, Record<string, string>>

function cantonFromDescription(description: string): QuoteCanton | '' {
  const text = description.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (/\b(ge|geneve|geneva|ginebra)\b/.test(text)) return 'GE'
  if (/\b(vd|vaud|vaudois|lausanne)\b/.test(text)) return 'VD'
  if (/\b(fr|fribourg|friburgo|freiburg)\b/.test(text)) return 'FR'
  if (/\b(ne|neuchatel|neuchâtel)\b/.test(text)) return 'NE'
  if (/\b(vs|valais|valaisan|valaisanne|valaisano|valaisana)\b/.test(text)) return 'VS'
  return ''
}

const apiPropertyType: Record<QuotePropertyType, string> = { apartment: 'appartement', house: 'maison', airbnb: 'airbnb', office: 'bureaux', shop: 'boutiques', clinic: 'cliniques_cabinets', concierge: 'conciergerie' }
const apiServiceType: Record<QuoteServiceType, string> = { standard: 'regular', endOfTenancy: 'fin_de_bail', postConstruction: 'post_travaux' }
const apiFrequency: Record<QuoteFrequency, string> = { oneTime: 'oneTime', weekly: 'weekly', biweekly: 'biweekly', monthly: 'monthly' }
const quoteCantonOptions = Object.keys(quoteCantons) as QuoteCanton[]

export function QuoteEstimator({ locale, onClose, onCreate }: { locale: Locale; onClose: () => void; onCreate?: (quote: QuoteDraft) => void }) {
  const t: Record<string, string> = copy[locale]
  const [customerType, setCustomerType] = useState<'prive' | 'pro'>('prive')
  const [fillMethod, setFillMethod] = useState<'click' | 'ai'>('click')
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [property, setProperty] = useState<QuotePropertyType>('apartment')
  const [serviceType, setServiceType] = useState<QuoteServiceType>('standard')
  const [area, setArea] = useState(75)
  const [bathrooms, setBathrooms] = useState(1)
  const [frequency, setFrequency] = useState<QuoteFrequency>('oneTime')
  const [extras, setExtras] = useState<QuoteExtra[]>([])
  const [description, setDescription] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [parsedDescription, setParsedDescription] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiSource, setAiSource] = useState<'ai' | 'fallback'>('ai')
  const [postalCode, setPostalCode] = useState('')
  const [selectedCanton, setSelectedCanton] = useState<QuoteCanton | ''>('')
  const [detailsReady, setDetailsReady] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [contactOpen, setContactOpen] = useState(false)
  const [created, setCreated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiQuote, setApiQuote] = useState<KeyedLiveQuote | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [error, setError] = useState('')

  const isAirbnb = property === 'airbnb'
  const postalCanton = cantonFromPostalCode(postalCode)
  const airbnbTariff = isAirbnb ? airbnbPricingForPostalCode(postalCode) : null
  const canton = postalCanton || selectedCanton
  const quote = useMemo(() => canton && /^\d{4}$/.test(postalCode) && (!isAirbnb || airbnbTariff) ? createQuoteCalculation({ property, serviceType, area, bathrooms, frequency, extras, canton, postalCode }) : null, [property, serviceType, area, bathrooms, frequency, extras, canton, postalCode, isAirbnb, airbnbTariff])
  const calculation = quote?.calculation
  const quoteKey = `${property}:${serviceType}:${area}:${bathrooms}:${frequency}:${postalCode}:${canton ?? ''}:${extras.join(',')}`

  useEffect(() => {
    if (!canton || !quote) {
      setApiQuote(null)
      setApiLoading(false)
      return
    }

    const controller = new AbortController()
    setApiQuote(null)
    setApiLoading(true)

    fetch('/api/app-devis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        npa: /^\d{4}$/.test(postalCode) ? postalCode : '0000',
        canton,
        sqm: area,
        bathrooms,
        propertyType: apiPropertyType[property],
        serviceType: apiServiceType[serviceType],
        frequency: apiFrequency[frequency],
        selectedExtras: extras,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Quote calculation failed')
        const result = (await response.json()) as LiveQuoteResponse
        if (result.success && Number.isFinite(result.financial?.total)) setApiQuote({ key: quoteKey, response: result })
      })
      .catch(() => {
        if (!controller.signal.aborted) setApiQuote(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setApiLoading(false)
      })

    return () => controller.abort()
  }, [canton, postalCode, area, bathrooms, property, serviceType, frequency, extras, quote, quoteKey])

  const rate = calculation?.hourlyRate ?? 0
  const duration = calculation?.laborHours ?? 0
  const recommendedCleaners = calculation?.recommendedCleaners ?? 1
  const onSiteHours = calculation?.onSiteHours ?? 0
  const total = (apiQuote?.key === quoteKey ? apiQuote.response.financial.total : null) ?? calculation?.total ?? null
  const money = total === null ? '—' : new Intl.NumberFormat(`${locale}-CH`, { style: 'currency', currency: 'CHF', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)
  const formatChf = (value: number | null | undefined) => value == null ? '—' : `CHF ${new Intl.NumberFormat('fr-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`
  const serviceLabel = serviceType === 'endOfTenancy' ? t.endOfTenancy : serviceType === 'postConstruction' ? t.postConstruction : t.standard
  const propertyLabel = property === 'office' ? t.office : property === 'shop' ? t.shop : property === 'clinic' ? t.clinic : property === 'house' ? t.house : property === 'airbnb' ? t.airbnb : property === 'concierge' ? t.concierge : t.apartment
  const propertyOptions: QuotePropertyType[] = customerType === 'prive' ? ['apartment', 'house', 'airbnb'] : ['office', 'shop', 'clinic', 'concierge']
  async function interpretDescription() {
    if (aiQuestion ? !followUp.trim() : description.trim().length < 12) {
      setError(aiQuestion ? t.addDetails : t.required)
      return
    }
    const completeDescription = [parsedDescription || description.trim(), followUp.trim()].filter(Boolean).join('\nAdditional details: ')
    setLoading(true)
    setDetailsReady(false)
    setError('')
    try {
      const response = await fetch('/api/quote-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: completeDescription, locale }),
      })
      if (!response.ok) throw new Error('Could not interpret quote description')
      const details = (await response.json()) as QuoteDetails
      const mappedProperty: QuotePropertyType | null = details.property === 'studio' ? 'apartment' : details.property === 'farm' ? 'house' : details.property
      const nextProperty = mappedProperty ?? property
      const nextCustomerType = ['office', 'shop', 'clinic', 'concierge'].includes(nextProperty) ? 'pro' : 'prive'
      const nextServiceType = details.serviceType === 'endOfTenancy' && nextCustomerType === 'pro' ? 'standard' : details.serviceType ?? serviceType
      setCustomerType(nextCustomerType)
      setProperty(nextProperty)
      setServiceType(nextServiceType)
      setArea(details.area ?? area)
      setBathrooms(details.inventory.bathrooms ?? bathrooms)
      setFrequency(details.frequency ?? frequency)
      if (details.extras.length) setExtras(details.extras)
      const detectedPostalCode = details.postalCode ?? postalCode
      const detectedCanton = cantonFromPostalCode(detectedPostalCode) || selectedCanton || cantonFromDescription(completeDescription)
      setParsedDescription(completeDescription)
      setFollowUp('')
      setPostalCode(detectedPostalCode)
      setSelectedCanton(detectedCanton)
      setDetailsReady(Boolean((mappedProperty || property) && (details.area !== null || area > 0) && (details.inventory.bathrooms !== null || bathrooms >= 0) && /^\d{4}$/.test(detectedPostalCode) && detectedCanton && !details.question))
      setAiSummary(details.summary)
      setAiQuestion(details.question ?? (!detectedCanton ? t.includeCanton : ''))
      setAiSource(details.source)
    } catch {
      setError(t.aiError)
    } finally {
      setLoading(false)
    }
  }

  function createQuote() {
    if (!/^\d{4}$/.test(postalCode)) {
      setError(t.postalRequired)
      return
    }
    if (!canton) {
      setError(t.includeCanton)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || phone.replace(/\D/g, '').length < 7) {
      setContactOpen(true)
      setError(t.contactRequired)
      return
    }
    setError('')
    const { input, calculation: quoteCalculation, pricingVersion } = createQuoteCalculation({ property, serviceType, area, bathrooms, frequency, extras, canton, postalCode })
    onCreate?.({ ...input, ...quoteCalculation, name: name.trim(), email: email.trim(), phone: phone.trim(), description: quoteDescription, pricingVersion })
    setCreated(true)
  }

  const greeting = locale === 'es' ? 'Hola' : locale === 'fr' ? 'Bonjour' : 'Hello'
  const intro = locale === 'es' ? 'Estimación orientativa de limpieza' : locale === 'fr' ? 'Estimation indicative de nettoyage' : 'Indicative cleaning estimate'
  const signoff = locale === 'es' ? 'Un saludo' : locale === 'fr' ? 'Cordialement' : 'Best regards'
  const disclaimer = isAirbnb ? t.airbnbDisclaimer : t.disclaimer
  const quoteDescription = parsedDescription || description.trim() || `${propertyLabel}, ${area} m², ${bathrooms} ${t.bathrooms}, NPA ${postalCode}, ${serviceLabel}`

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="estimator-modal quote-estimator-modal" role="dialog" aria-modal="true" aria-labelledby="estimator-title">
        <div className="quote-estimator-mascot" aria-hidden="true">
          <Image src="/hs-quality-service-dog.png" alt="" width={1536} height={1024} sizes="100vw" />
        </div>
        <header className="modal-header">
          <div className="modal-title-icon"><Sparkles size={19} /></div>
          <div><p className="eyebrow">{t.kicker}</p><h2 id="estimator-title">{t.title}</h2><p>{t.hint}</p></div>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </header>
        {created ? (
          <div className="quote-success">
            <div className="success-check"><Check size={24} /></div><h3>{t.success}</h3><p>{name || 'Client'} · {serviceLabel} · {recommendedCleaners} {recommendedCleaners === 1 ? t.cleanerSingular : t.cleanerPlural} · {money}</p>
            <a className="primary-button" href={`mailto:${email}?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(`${greeting} ${name || ''},\n\n${intro}: ${money} ${t.perVisit}.\n${canton ? quoteCantons[canton].label : '—'} · ${postalCode || '—'}\n${t.area}: ${area} m² · ${t.bathrooms}: ${bathrooms}\n${t.phone}: ${phone.trim()}\n${serviceLabel}\n${t.baseFee}: CHF ${calculation?.baseFlatFee ?? 0} ${t.perVisit}\n${t.hourly}: CHF ${rate.toFixed(2)}/h × ${duration.toFixed(1)} ${t.laborHours}\n${t.laborTotal}: CHF ${((calculation?.baseAndLaborSubtotal ?? 0) - (calculation?.baseFlatFee ?? 0)).toFixed(2)}\n${t.extras}: CHF ${calculation?.extrasAmount.toFixed(2) ?? '0.00'}\n${t.frequencyDiscount}: CHF ${calculation?.frequencyDiscountAmount.toFixed(2) ?? '0.00'}\n${t.netSubtotal}: CHF ${calculation?.netSubtotal.toFixed(2) ?? '0.00'}\n${t.vat}: CHF ${calculation?.vatAmount.toFixed(2) ?? '0.00'}\n${t.team}: ${recommendedCleaners} · ${onSiteHours.toFixed(1)} ${t.onSite}\n\n${quoteDescription}\n\n${disclaimer}\n\n${signoff},\n${t.brand}`)}`}><Send size={15} />{t.send}</a>
            <button className="text-button success-close" onClick={onClose}>{t.cancel}</button>
          </div>
        ) : (
          <>
            <div className="estimator-workspace">
              <div className="modal-content estimator-form-column">
                <details className="quote-basics-section" open>
                  <summary>{t.propertyDetails}</summary>
                  <div className="quote-basic-fields">
                    <div className="customer-type-switch" role="group" aria-label={t.property}>
                      <button type="button" aria-pressed={customerType === 'prive'} className={customerType === 'prive' ? 'active' : ''} onClick={() => { setCustomerType('prive'); setProperty('apartment'); setServiceType('standard') }}>{t.customerPrivate}</button>
                      <button type="button" aria-pressed={customerType === 'pro'} className={customerType === 'pro' ? 'active' : ''} onClick={() => { setCustomerType('pro'); setProperty('office'); setServiceType('standard') }}>{t.customerPro}</button>
                    </div>
                    <div className="quote-fill-method">
                      <p>{t.methodLabel}</p>
                      <div role="group" aria-label={t.methodLabel}>
                        <button type="button" aria-pressed={fillMethod === 'click'} className={fillMethod === 'click' ? 'active' : ''} onClick={() => setFillMethod('click')}><Check size={15} />{t.quickMethod}</button>
                        <button type="button" aria-pressed={fillMethod === 'ai'} className={fillMethod === 'ai' ? 'active' : ''} onClick={() => { setFillMethod('ai'); setOptionsOpen(true) }}><Sparkles size={15} />{t.aiMethod}</button>
                      </div>
                    </div>
                    <div className="form-grid quote-form-grid">
                      <label className="field-label">{t.property}<select value={property} onChange={(event) => { const nextProperty = event.target.value as QuotePropertyType; setProperty(nextProperty); const nextCustomerType = ['office', 'shop', 'clinic', 'concierge'].includes(nextProperty) ? 'pro' : 'prive'; setCustomerType(nextCustomerType); if (nextCustomerType === 'pro' && serviceType === 'endOfTenancy') setServiceType('standard') }}>
                        {propertyOptions.map((value) => <option key={value} value={value}>{t[value]}</option>)}
                      </select></label>
                      <label className="field-label">{t.serviceType}<select value={serviceType} onChange={(event) => setServiceType(event.target.value as QuoteServiceType)}>
                        <option value="standard">{t.standard}</option>{customerType === 'prive' && <option value="endOfTenancy">{t.endOfTenancy}</option>}<option value="postConstruction">{t.postConstruction}</option>
                      </select></label>
                      <label className="field-label">{t.area} (m²)<input type="number" min={20} max={1000} value={area} onChange={(event) => setArea(Math.min(1000, Math.max(20, Number(event.target.value) || 20)))} /></label>
                      <label className="field-label">{t.bathrooms}<input type="number" min={0} max={20} value={bathrooms} onChange={(event) => setBathrooms(Math.min(20, Math.max(0, Number(event.target.value) || 0)))} /></label>
                      <label className="field-label">{t.postal}<input inputMode="numeric" autoComplete="postal-code" maxLength={4} value={postalCode} onChange={(event) => { setPostalCode(event.target.value.replace(/\D/g, '').slice(0, 4)); setSelectedCanton(''); setError('') }} placeholder="1200" /></label>
                      <label className="field-label">{t.location}<select value={postalCanton || selectedCanton} onChange={(event) => setSelectedCanton(event.target.value as QuoteCanton | '')} disabled={Boolean(postalCanton)}>
                        <option value="">{postalCanton ? `${t.cantonAuto} · ${quoteCantons[postalCanton].label}` : t.cantonManual}</option>{quoteCantonOptions.map((value) => <option key={value} value={value}>{quoteCantons[value].label}</option>)}
                      </select></label>
                      <label className="field-label frequency-label">{t.frequency}<select value={frequency} onChange={(event) => setFrequency(event.target.value as QuoteFrequency)}><option value="oneTime">{t.oneTime}</option><option value="weekly">{t.weekly}</option><option value="biweekly">{t.biweekly}</option><option value="monthly">{t.monthly}</option></select></label>
                    </div>
                  </div>
                </details>
                <details className="optional-quote-section" open={optionsOpen} onToggle={(event) => setOptionsOpen(event.currentTarget.open)}><summary>{t.optionalDetails}</summary><fieldset className="extras-fieldset"><legend>{t.extras}</legend><div className="extras-grid">{(['oven', 'fridge', 'windows', 'terrace'] as QuoteExtra[]).map((extra) => <label className="extra-option" key={extra}><input type="checkbox" checked={extras.includes(extra)} onChange={() => setExtras((current) => current.includes(extra) ? current.filter((item) => item !== extra) : [...current, extra])} /><span>{t[extra]}</span></label>)}</div></fieldset>
                  {fillMethod === 'ai' && <section className="ai-description-panel" aria-labelledby="ai-description-title"><div className="ai-description-heading"><span className="ai-mark"><Sparkles size={15} /></span><div><h3 id="ai-description-title">{t.describe}</h3><p>{t.panelHint}</p></div></div><label className="sr-only" htmlFor="quote-description">{t.describe}</label><textarea id="quote-description" maxLength={1200} rows={3} value={description} onChange={(event) => { setDescription(event.target.value); setFollowUp(''); setParsedDescription(''); setDetailsReady(false); setAiSummary(''); setAiQuestion(''); setError('') }} placeholder={t.placeholder} />
                    {aiQuestion && <div className="ai-follow-up"><label htmlFor="quote-follow-up">{t.addDetails}<span className="ai-question">{aiQuestion}</span></label><textarea id="quote-follow-up" rows={2} value={followUp} onChange={(event) => { setFollowUp(event.target.value); setError('') }} placeholder={t.followUpPlaceholder} /></div>}
                    <div className="ai-action-row"><span>{aiQuestion ? t.continueAnalysis : `${description.length}/1200`}</span><button className="secondary-button ai-action" type="button" onClick={interpretDescription} disabled={loading || (aiQuestion ? !followUp.trim() : description.trim().length < 12)}>{loading ? <LoaderCircle className="spin" size={15} /> : <Sparkles size={15} />}{loading ? t.analyzing : aiQuestion ? t.continueAnalysis : t.initialAnalyze}</button></div>
                    {aiSummary && <div className="ai-understanding"><strong>{aiSource === 'fallback' ? t.fallbackTitle : t.assistTitle}</strong>{aiSource === 'fallback' && <p className="ai-fallback-note">{t.fallbackNotice}</p>}<p>{aiSummary}</p>{detailsReady && <p className="ai-detected-details">{[propertyLabel, `${t.area}: ${area} m²`, `${t.bathrooms}: ${bathrooms}`, `${t.postal}: ${postalCode}`, serviceLabel, ...extras.map((extra) => t[extra])].join(' · ')}</p>}</div>}
                  </section>}
                </details>
                <details className="client-details" open={contactOpen} onToggle={(event) => setContactOpen(event.currentTarget.open)}><summary>{t.contactDetails}</summary><div className="client-fields"><label className="field-label">{t.name}<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Camille Martin" /></label><label className="field-label">{t.email}<input type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} placeholder="client@example.ch" /></label><label className="field-label">{t.phone}<input type="tel" autoComplete="tel" required value={phone} onChange={(event) => { setPhone(event.target.value); setError('') }} placeholder="+41 79 123 45 67" /></label></div></details>
                {error && <p className="ai-error" role="alert">{error}</p>}
              </div>
              <aside className="estimator-summary-panel" aria-label={t.estimateIndicative}>
                <p className="estimator-summary-kicker">{t.estimateIndicative}</p>
                <p className="estimator-summary-service">{quote ? `${serviceLabel} · ${area} m² · ${postalCode}` : t.waitingForDetails}</p>
                <strong className="estimator-summary-price" aria-live="polite">{total !== null ? money : '—'}</strong>
                {!quote && <p className="estimate-disclaimer">{postalCode.length === 4 && !canton ? t.selectCanton : t.npaRequired}</p>}
                {quote && <details className="estimate-details"><summary>{t.priceBreakdown}</summary>
                  <p className="estimator-summary-equation">{t.rateFormula}</p>
                  <div className="crew-recommendation" aria-live="polite"><div className="crew-icon"><Users size={17} /></div><div className="crew-copy"><strong>{t.teamRecommendation}: {recommendedCleaners} {recommendedCleaners === 1 ? t.cleanerSingular : t.cleanerPlural}</strong><span>{onSiteHours.toFixed(1)} h {t.onSiteDuration} · {duration.toFixed(1)} {t.laborHours}</span></div></div>
                  <div className="estimate-breakdown"><p>{t.priceBreakdown}</p>{airbnbTariff && <div><span>{t.tariffRegion} · {airbnbTariff.label}</span><strong>CHF {airbnbTariff.hourlyRate}/h</strong></div>}<div><span>{t.baseFee}</span><strong>{formatChf(calculation?.baseFlatFee)}</strong></div><div><span>{t.laborTotal} · {duration.toFixed(1)} h</span><strong>{formatChf(calculation?.laborCost)}</strong></div>{calculation?.extrasAmount ? <div><span>{t.extras}</span><strong>{formatChf(calculation.extrasAmount)}</strong></div> : null}{calculation?.frequencyDiscountAmount ? <div><span>{t.frequencyDiscount}</span><strong>− {formatChf(calculation.frequencyDiscountAmount)}</strong></div> : null}</div>
                  <div className="estimate-final-totals" aria-live="polite"><div><span>{t.estimatedHoursLabel}</span><strong>{duration.toFixed(1)} h</strong></div><div><span>{t.netPriceLabel}</span><strong>{formatChf(calculation?.netSubtotal)}</strong></div><div><span>{t.vat}</span><strong>{formatChf(calculation?.vatAmount)}</strong></div><div className="estimate-final-total"><span>{t.totalLabel}</span><strong>{formatChf(total)}</strong></div></div>
                  <span className="sr-only" aria-live="polite">{apiLoading ? t.calculating : apiQuote?.key === quoteKey ? t.updated : ''}</span>
                </details>}
                {quote && <p className="estimate-disclaimer">{disclaimer}</p>}
              </aside>
            </div>
            <footer className="modal-footer"><button className="secondary-button" onClick={onClose}>{t.cancel}</button><button className="primary-button" onClick={createQuote} disabled={!quote || !canton}><Check size={15} />{t.create}</button></footer>
          </>
        )}
      </section>
    </div>
  )
}

