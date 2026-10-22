'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Check, House, LoaderCircle, Sparkles } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

type CalculatorResponse = {
  success: true
  analysis: {
    sector: 'particular' | 'professional' | 'airbnb'
    prestation: 'standard' | 'fin_de_bail' | 'fin_travaux' | 'clinique'
    canton: string
    cantonCode: string
    hourlyRatePerWorker: number
    recommendedPeople: number
    totalLaborHours: number
    detectedRooms: number
    detectedBathrooms: number
    extractedVitrineSqm: number
    isMicroVitrineService: boolean
    isMountain: boolean
    isDeepClean: boolean
    needsLaundry: boolean
    extrasFound: { oven: boolean; fridge: boolean; greaseWall: boolean }
  }
  pricing: { hoursEstimated: number; subtotal: number; tva: number; total: number }
}

type ServiceType = 'particular' | 'professional' | 'airbnb' | 'fin_de_bail' | 'fin_travaux' | 'clinique'
type CalculatorRequest = { textDescription: string; serviceType: ServiceType; npa: string; sqm: string }

const copy = {
  fr: {
    eyebrow: 'ESTIMATION RAPIDE',
    title: 'Devis instantané intelligent',
    intro: 'Décrivez votre projet et obtenez une estimation indicative adaptée à votre adresse.',
    postal: 'NPA (code postal)',
    area: 'Surface estimée (m²)',
    description: 'Décrivez votre demande',
    serviceType: 'Choisissez la prestation',
    chooseService: 'Sélectionnez un service…',
    serviceHint: 'Choisissez le service, puis décrivez le logement ou les locaux et ce qu’il faut nettoyer.',
    detailHint: 'Précisez si possible le nombre de pièces et de salles de bain, les équipements (four, réfrigérateur, vitres), le niveau de nettoyage et toute demande particulière.',
    placeholder: 'Ex. : appartement de 3 pièces et 2 salles de bain, nettoyage de fin de bail, four et réfrigérateur à nettoyer…',
    sector: 'Secteur',
    private: 'Particulier',
    professional: 'Professionnel',
    airbnb: 'Location saisonnière',
    oven: 'Nettoyage du four',
    fridge: 'Nettoyage du réfrigérateur',
    rooms: 'pièces détectées',
    deepClean: 'Nettoyage en profondeur',
    laundry: 'Supplément blanchisserie',
    vitrineArea: 'm² de vitrines',
    bathrooms: 'salles de bain',
    greaseWall: 'Dégraissage des murs',
    microVitrine: 'Intervention vitrine seule',
    mountain: 'Zone de montagne',
    canton: 'Canton',
    service: 'Prestation',
    standard: 'Standard',
    endOfLease: 'Fin de bail',
    clinic: 'Protocole clinique',
    postConstruction: 'Nettoyage après travaux',
    people: 'Équipe recommandée',
    laborHours: 'Heures de travail cumulées',
    workerRate: 'Tarif horaire par personne',
    analysisHeading: 'Analyse de votre demande',
    sectorBadge: 'Secteur',
    glassIncluded: 'Vitrine prise en compte',
    microVitrineActive: 'Forfait technique vitrine activé',
    estimate: 'Votre estimation indicative',
    hours: 'Durée estimée',
    net: 'Prix net',
    vat: 'TVA (8,1 %)',
    total: 'Total estimé',
    calculating: 'Calcul de votre estimation…',
    waiting: 'Choisissez une prestation et décrivez votre demande pour obtenir une estimation.',
    error: 'Impossible de calculer cette estimation. Vérifiez le NPA et la surface.',
  },
  es: {
    eyebrow: 'ESTIMACIÓN RÁPIDA',
    title: 'Presupuesto inteligente al instante',
    intro: 'Describe tu proyecto y recibe una estimación orientativa según tu zona.',
    postal: 'NPA (código postal)',
    area: 'Superficie estimada (m²)',
    description: 'Describe lo que necesitas',
    serviceType: 'Elige el servicio',
    chooseService: 'Selecciona un servicio…',
    serviceHint: 'Elige el servicio y después describe el tipo de vivienda o local y qué necesitas limpiar.',
    detailHint: 'Para afinar el cálculo, indica cuántas habitaciones y baños hay, qué equipos o cristales hay que limpiar, si es una limpieza profunda o de fin de contrato y cualquier detalle especial.',
    placeholder: 'Ej.: piso de 3 habitaciones y 2 baños; limpieza de fin de contrato, horno y nevera…',
    sector: 'Sector',
    private: 'Particular',
    professional: 'Profesional',
    airbnb: 'Alquiler vacacional',
    oven: 'Limpieza del horno',
    fridge: 'Limpieza de la nevera',
    rooms: 'habitaciones detectadas',
    deepClean: 'Limpieza profunda',
    laundry: 'Suplemento de lavandería',
    vitrineArea: 'm² de escaparates',
    bathrooms: 'baños',
    greaseWall: 'Desengrasado de paredes',
    microVitrine: 'Servicio solo de escaparate',
    mountain: 'Zona de montaña',
    canton: 'Cantón',
    service: 'Prestación',
    standard: 'Estándar',
    endOfLease: 'Fin de contrato',
    clinic: 'Protocolo clínico',
    postConstruction: 'Limpieza después de obra',
    people: 'Personal recomendado',
    laborHours: 'Horas de trabajo totales',
    workerRate: 'Tarifa por hora y persona',
    analysisHeading: 'Análisis de tu solicitud',
    sectorBadge: 'Sector',
    glassIncluded: 'Escaparate incluido en el cálculo',
    microVitrineActive: 'Tarifa técnica de escaparate activada',
    estimate: 'Tu estimación orientativa',
    hours: 'Duración estimada',
    net: 'Precio neto',
    vat: 'IVA (8,1 %)',
    total: 'Total estimado',
    calculating: 'Calculando tu estimación…',
    waiting: 'Elige un servicio y describe lo que necesitas para calcular el presupuesto.',
    error: 'No se pudo calcular la estimación. Comprueba el NPA y la superficie.',
  },
  en: {
    eyebrow: 'QUICK ESTIMATE',
    title: 'Smart instant quote',
    intro: 'Describe your project to get an indicative estimate for your area.',
    postal: 'Postal code (NPA)',
    area: 'Estimated area (m²)',
    description: 'Describe what you need',
    serviceType: 'Choose a service',
    chooseService: 'Select a service…',
    serviceHint: 'Choose the service, then describe the property or premises and what needs cleaning.',
    detailHint: 'For a more accurate estimate, include the number of rooms and bathrooms, appliances or windows to clean, whether it is a deep or end-of-lease clean, and any special requests.',
    placeholder: 'E.g. 3-room, 2-bath apartment; end-of-lease clean, including the oven and fridge…',
    sector: 'Sector',
    private: 'Residential',
    professional: 'Professional',
    airbnb: 'Holiday rental',
    oven: 'Oven cleaning',
    fridge: 'Refrigerator cleaning',
    rooms: 'rooms detected',
    deepClean: 'Deep cleaning',
    laundry: 'Laundry supplement',
    vitrineArea: 'm² of storefront glass',
    bathrooms: 'bathrooms',
    greaseWall: 'Kitchen wall degreasing',
    microVitrine: 'Storefront glass-only service',
    mountain: 'Mountain service area',
    canton: 'Canton',
    service: 'Service type',
    standard: 'Standard',
    endOfLease: 'End of lease',
    clinic: 'Clinical protocol',
    postConstruction: 'Post-construction cleaning',
    people: 'Recommended team',
    laborHours: 'Total labor hours',
    workerRate: 'Hourly rate per person',
    analysisHeading: 'Request analysis',
    sectorBadge: 'Sector',
    glassIncluded: 'Storefront glass included',
    microVitrineActive: 'Technical glass-service rate activated',
    estimate: 'Your indicative estimate',
    hours: 'Estimated time',
    net: 'Net price',
    vat: 'VAT (8.1%)',
    total: 'Estimated total',
    calculating: 'Calculating your estimate…',
    waiting: 'Choose a service and describe what you need to get an estimate.',
    error: 'The estimate could not be calculated. Check the postal code and area.',
  },
} satisfies Record<Locale, Record<string, string>>

function formatHours(hours: number) {
  return hours.toFixed(2).replace(/\.?0+$/, '')
}

async function fetchEstimate(key: string): Promise<CalculatorResponse> {
  const request = JSON.parse(key) as CalculatorRequest
  const response = await fetch('/api/calculateur-ia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) throw new Error('Estimate request failed')
  return response.json() as Promise<CalculatorResponse>
}

export function SmartCalculator({ locale }: { locale: Locale }) {
  const t = copy[locale]
  const [description, setDescription] = useState('')
  const [selectedService, setSelectedService] = useState<ServiceType | ''>('')
  const [npa, setNpa] = useState('1200')
  const [sqm, setSqm] = useState('75')
  const [debouncedRequest, setDebouncedRequest] = useState<CalculatorRequest | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const cleanDescription = description.trim()
      const validNpa = /^\d{4}$/.test(npa)
      const validArea = Number(sqm) >= 1 && Number(sqm) <= 1000

      setDebouncedRequest(cleanDescription.length > 10 && selectedService && validNpa && validArea
        ? { textDescription: cleanDescription, serviceType: selectedService, npa, sqm }
        : null)
    }, 800)

    return () => window.clearTimeout(timeout)
  }, [description, selectedService, npa, sqm])

  const requestKey = debouncedRequest ? JSON.stringify(debouncedRequest) : null
  const { data, error, isLoading } = useSWR<CalculatorResponse>(requestKey, fetchEstimate, {
    dedupingInterval: 2000,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const currency = (amount: number) => new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return (
    <section className="smart-calculator" aria-labelledby="smart-calculator-title">
      <div className="smart-calculator-heading">
        <div>
          <p className="smart-calculator-eyebrow"><Sparkles aria-hidden="true" />{t.eyebrow}</p>
          <h2 id="smart-calculator-title">{t.title}</h2>
          <p>{t.intro}</p>
        </div>
      </div>

      <div className="smart-calculator-fields">
        <label>
          <span>{t.postal}</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={4}
            value={npa}
            onChange={(event) => setNpa(event.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </label>
        <label>
          <span>{t.area}</span>
          <input
            type="number"
            min={1}
            max={1000}
            inputMode="numeric"
            value={sqm}
            onChange={(event) => setSqm(event.target.value)}
          />
        </label>
        <div className="smart-calculator-description">
          <label htmlFor="smart-calculator-service">{t.serviceType}</label>
          <select
            id="smart-calculator-service"
            value={selectedService}
            onChange={(event) => setSelectedService(event.target.value as ServiceType | '')}
            aria-describedby="smart-calculator-service-hint"
            required
          >
            <option value="">{t.chooseService}</option>
            <option value="particular">{t.private}</option>
            <option value="professional">{t.professional}</option>
            <option value="airbnb">{t.airbnb}</option>
            <option value="fin_de_bail">{t.endOfLease}</option>
            <option value="fin_travaux">{t.postConstruction}</option>
            <option value="clinique">{t.clinic}</option>
          </select>
          <p className="smart-calculator-field-hint" id="smart-calculator-service-hint">{t.serviceHint}</p>
          <label htmlFor="smart-calculator-description">{t.description}</label>
          <p className="smart-calculator-field-hint" id="smart-calculator-detail-hint">{t.detailHint}</p>
          <textarea
            id="smart-calculator-description"
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t.placeholder}
            aria-describedby="smart-calculator-detail-hint"
          />
        </div>
      </div>

      <div className="smart-calculator-result" aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          <p className="smart-calculator-status"><LoaderCircle aria-hidden="true" />{t.calculating}</p>
        ) : error ? (
          <p className="smart-calculator-status smart-calculator-error" role="alert">{t.error}</p>
        ) : data?.success ? (
          <>
            <div className="smart-calculator-result-heading">
              <h3>{t.analysisHeading}</h3>
              <span className="smart-calculator-sector-badge">
                {t.sectorBadge}: {data.analysis.sector === 'professional' ? t.professional : data.analysis.sector === 'airbnb' ? t.airbnb : t.private}
              </span>
            </div>
            <p className="smart-calculator-result-location">
              {data.analysis.canton} ({data.analysis.cantonCode})
              <span aria-hidden="true"> · </span>
              {t.service}: {data.analysis.prestation === 'fin_de_bail' ? t.endOfLease : data.analysis.prestation === 'fin_travaux' ? t.postConstruction : data.analysis.prestation === 'clinique' ? t.clinic : t.standard}
            </p>
            <div className="smart-calculator-tags">
              {data.analysis.detectedRooms > 0 && <span><House aria-hidden="true" />{data.analysis.detectedRooms} {t.rooms}</span>}
              {data.analysis.detectedBathrooms > 0 && <span>{data.analysis.detectedBathrooms} {t.bathrooms}</span>}
              {data.analysis.isDeepClean && <span>{t.deepClean}</span>}
              {data.analysis.needsLaundry && <span>{t.laundry}</span>}
              {data.analysis.extrasFound.oven && <span>{t.oven}</span>}
              {data.analysis.extrasFound.fridge && <span>{t.fridge}</span>}
              {data.analysis.extrasFound.greaseWall && <span>{t.greaseWall}</span>}
              {data.analysis.extractedVitrineSqm > 0 && (
                <span><Sparkles aria-hidden="true" />{t.glassIncluded} · {data.analysis.extractedVitrineSqm} {t.vitrineArea}</span>
              )}
              {data.analysis.isMicroVitrineService && (
                <span className="smart-calculator-tag-success"><Check aria-hidden="true" />{t.microVitrineActive}</span>
              )}
              {data.analysis.isMountain && <span>{t.mountain}</span>}
            </div>
            <dl className="smart-calculator-breakdown">
              <div><dt>{t.hours}</dt><dd>{formatHours(data.pricing.hoursEstimated)} h</dd></div>
              <div><dt>{t.people}</dt><dd>{data.analysis.recommendedPeople}</dd></div>
              <div><dt>{t.laborHours}</dt><dd>{formatHours(data.analysis.totalLaborHours)} h</dd></div>
              <div><dt>{t.workerRate}</dt><dd>{currency(data.analysis.hourlyRatePerWorker)}/h</dd></div>
              <div><dt>{t.net}</dt><dd>{currency(data.pricing.subtotal)}</dd></div>
              <div><dt>{t.vat}</dt><dd>{currency(data.pricing.tva)}</dd></div>
              <div className="smart-calculator-total"><dt>{t.total}</dt><dd>{currency(data.pricing.total)}</dd></div>
            </dl>
          </>
        ) : (
          <p className="smart-calculator-status">{t.waiting}</p>
        )}
      </div>
    </section>
  )
}
