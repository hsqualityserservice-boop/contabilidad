import {
  airbnbPostalPricing,
  cantonFromPostalCode,
  type QuoteCanton,
} from '@/lib/quote-pricing'

export const clientServiceTypes = {
  prive_regular: { label: 'Limpieza de mantenimiento' },
  fin_de_bail: { label: 'Fin de contrato / mudanza' },
  fin_travaux: { label: 'Limpieza tras obras' },
  bureaux: { label: 'Oficinas' },
  cabinet_medical: { label: 'Consultorio / clínica' },
  conciergerie: { label: 'Conserjería' },
  airbnb: { label: 'Airbnb / alquiler vacacional' },
} as const

export type ClientServiceType = keyof typeof clientServiceTypes
export type ClientCanton = QuoteCanton
export type ClientPropertyType = 'apartment' | 'studio' | 'house' | 'farm' | 'office' | 'shop' | 'airbnb'
export type ClientQuoteDetails = {
  propertyType: ClientPropertyType
  bedrooms: number
  kitchens: number
  livingRooms: number
  offices: number
  tables: number
  desks: number
  vitrines: number
  windows: number
  wallArea: number
  cleanWalls: boolean
  postConstructionDust: boolean
  paintMarks: boolean
  parkingAvailable?: boolean
  keyHandover?: boolean
  legalTermsAcceptedAt?: string
}
export type ClientNumericDetail = Exclude<keyof ClientQuoteDetails, 'propertyType' | 'cleanWalls' | 'postConstructionDust' | 'paintMarks' | 'parkingAvailable' | 'keyHandover'>

export const emptyClientQuoteDetails: ClientQuoteDetails = {
  propertyType: 'apartment', bedrooms: 0, kitchens: 0, livingRooms: 0,
  offices: 0, tables: 0, desks: 0, vitrines: 0, windows: 0,
  wallArea: 0, cleanWalls: false, postConstructionDust: false, paintMarks: false,
  parkingAvailable: false, keyHandover: false,
}

export type ClientQuoteInput = {
  serviceType: ClientServiceType
  canton: ClientCanton
  postalCode: string
  surfaceArea: number
  bathrooms: number
  windowArea: number
  terraceArea: number
  includeOven: boolean
  includeFridge: boolean
  includeWindows: boolean
  includeTerrace: boolean
  details: ClientQuoteDetails
}

export function calculateClientQuote(input: ClientQuoteInput) {
  const postalCode = input.postalCode.trim()
  const npa = /^\d{4}$/.test(postalCode) ? Number.parseInt(postalCode, 10) : 0
  const isMountain = isMountainClientPostalCode(postalCode)
  const isAirbnb = input.serviceType === 'airbnb'
  let baseHourlyRate = 36
  let hourlyRate = 36
  let baseFlatFee = 40

  if (isAirbnb) {
    const regionalRate = airbnbPricingForClientNpa(postalCode)
    baseFlatFee = regionalRate.base
    hourlyRate = regionalRate.hourly
  } else {
    if (npa >= 1200 && npa <= 1299) baseHourlyRate = 42
    else if ((npa >= 1000 && npa <= 1199) || (npa >= 1300 && npa <= 1599)) baseHourlyRate = 38
    else if (npa >= 1800 && npa <= 1999) baseHourlyRate = 35

    hourlyRate = baseHourlyRate * (isMountain ? 1.25 : 1)
    if (input.serviceType === 'fin_de_bail') baseFlatFee = 120
    else if (input.serviceType === 'cabinet_medical') {
      baseFlatFee = 105
      hourlyRate += 5
    } else if (input.serviceType === 'conciergerie') baseFlatFee = 90
  }

  const detail = input.details
  const detailHours = detail.bedrooms * 0.2
    + detail.kitchens * 0.35
    + detail.livingRooms * 0.2
    + detail.offices * 0.2
    + detail.tables * 0.08
    + detail.desks * 0.1
    + detail.vitrines * 0.18
    + detail.windows * 0.08
    + (detail.cleanWalls ? detail.wallArea * 0.012 : 0)
    + (detail.postConstructionDust ? input.surfaceArea * 0.025 : 0)
    + (detail.paintMarks ? detail.wallArea * 0.015 : 0)
  const hours = Math.max(1, Math.ceil(input.surfaceArea * 0.05 + input.bathrooms * 0.5 + detailHours))
  const breakdownExtras: Array<{ id: string; cost: number }> = []
  if (input.includeOven) breakdownExtras.push({ id: 'oven', cost: EXTRA_PRICES.four })
  if (input.includeFridge) breakdownExtras.push({ id: 'fridge', cost: EXTRA_PRICES.frigo })
  if (input.includeWindows) breakdownExtras.push({ id: 'windows', cost: input.windowArea * EXTRA_PRICES.fenetre })
  if (input.includeTerrace) breakdownExtras.push({ id: 'terrace', cost: input.terraceArea * EXTRA_PRICES.terrasse })
  if (detail.cleanWalls && detail.wallArea > 0) breakdownExtras.push({ id: 'walls', cost: detail.wallArea * 2.5 })
  if (detail.postConstructionDust) breakdownExtras.push({ id: 'postConstructionDust', cost: input.surfaceArea * 2.5 })
  if (detail.paintMarks && detail.wallArea > 0) breakdownExtras.push({ id: 'paintMarks', cost: detail.wallArea * 3.5 })

  const laborCost = hours * hourlyRate
  const extrasAmount = breakdownExtras.reduce((sum, extra) => sum + extra.cost, 0)
  const netSubtotal = roundToFiveCents(baseFlatFee + laborCost + extrasAmount)
  const vatAmount = Math.round(netSubtotal * 0.081 * 100) / 100
  const total = roundToFiveCents(netSubtotal + vatAmount)
  const crewSize = Math.max(1, Math.ceil(hours / 4.5))
  const prestationId = input.serviceType === 'fin_de_bail'
    ? 'fin_de_bail'
    : input.serviceType === 'fin_travaux'
      ? 'post_travaux'
      : input.serviceType === 'bureaux'
        ? 'bureaux'
        : input.serviceType === 'cabinet_medical'
          ? 'clinique'
          : 'regular'

  return {
    hourlyRate,
    prestationId,
    prestationLabel: clientServiceTypes[input.serviceType].label,
    baseFlatFee,
    laborCost,
    baseAndLaborSubtotal: baseFlatFee + laborCost,
    extrasAmount,
    breakdownExtras,
    mountainSupplementPercentage: isMountain && !isAirbnb ? 0.25 : 0,
    mountainSupplementAmount: isMountain && !isAirbnb ? Math.round(hours * baseHourlyRate * 0.25 * 100) / 100 : 0,
    frequencyDiscountAmount: 0,
    netSubtotal,
    vatAmount,
    hours,
    laborHours: hours,
    crewSize,
    recommendedCleaners: crewSize,
    onSiteHours: Math.ceil((hours / crewSize) * 4) / 4,
    total,
  }
}

function airbnbPricingForClientNpa(postalCode: string) {
  const npa = Number.parseInt(postalCode, 10)
  if (isMountainClientPostalCode(postalCode)) return { base: airbnbPostalPricing.mountain.baseFee, hourly: airbnbPostalPricing.mountain.hourlyRate }
  if (npa >= 1200 && npa <= 1299) return { base: airbnbPostalPricing.geneva.baseFee, hourly: airbnbPostalPricing.geneva.hourlyRate }
  if ((npa >= 1000 && npa <= 1199) || (npa >= 1300 && npa <= 1599)) return { base: airbnbPostalPricing.vaud.baseFee, hourly: airbnbPostalPricing.vaud.hourlyRate }
  return { base: airbnbPostalPricing.lowland.baseFee, hourly: airbnbPostalPricing.lowland.hourlyRate }
}

function roundToFiveCents(amount: number) {
  return Math.round((amount + Number.EPSILON) * 20) / 20
}

export function isMountainClientPostalCode(postalCode: string) {
  return /^\d{4}$/.test(postalCode)
    && airbnbPostalPricing.mountainNpaExact.includes(postalCode as (typeof airbnbPostalPricing.mountainNpaExact)[number])
}

export function getClientPostalCanton(postalCode: string) {
  return cantonFromPostalCode(postalCode)
}

export const cantonOptions: { code: ClientCanton; label: string }[] = [
  { code: 'GE', label: 'Ginebra (GE)' },
  { code: 'VD', label: 'Vaud / Lausana (VD)' },
  { code: 'FR', label: 'Friburgo (FR)' },
  { code: 'NE', label: 'Neuchâtel (NE)' },
  { code: 'VS', label: 'Valais (VS)' },
]

export const EXTRA_PRICES = {
  four: 60,
  frigo: 40,
  fenetre: 8,
  terrasse: 4,
} as const
