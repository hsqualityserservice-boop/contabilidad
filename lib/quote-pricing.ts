export const quoteCantons = {
  GE: { label: 'Ginebra · Genève (GE)', base_hourly_rate: 42 },
  VD: { label: 'Vaud (VD)', base_hourly_rate: 38 },
  FR: { label: 'Friburgo · Fribourg (FR)', base_hourly_rate: 38 },
  NE: { label: 'Neuchâtel (NE)', base_hourly_rate: 38 },
  VS: { label: 'Valais (VS)', base_hourly_rate: 38 },
} as const

export type QuoteCanton = keyof typeof quoteCantons
export const quoteCantonOptions = Object.keys(quoteCantons) as QuoteCanton[]
export const quotePropertyTypes = ['apartment', 'house', 'airbnb', 'office', 'shop', 'clinic', 'concierge'] as const
export type QuotePropertyType = (typeof quotePropertyTypes)[number]
export type QuoteServiceType = 'standard' | 'endOfTenancy' | 'postConstruction'
export type QuoteFrequency = 'oneTime' | 'weekly' | 'biweekly' | 'monthly'
export type QuoteExtra = 'oven' | 'fridge' | 'windows' | 'terrace'
export type QuotePrestationId = 'regular' | 'fin_de_bail' | 'post_travaux' | 'bureaux' | 'clinique'

export type QuoteCalculationInput = {
  property: QuotePropertyType
  serviceType: QuoteServiceType
  area: number
  bathrooms?: number
  frequency: QuoteFrequency
  extras: QuoteExtra[]
  canton: QuoteCanton
  postalCode: string
  prestationId?: QuotePrestationId
}

export type QuoteCalculation = {
  hourlyRate: number
  prestationId: QuotePrestationId
  prestationLabel: string
  baseFlatFee: number
  laborCost: number
  baseAndLaborSubtotal: number
  extrasAmount: number
  breakdownExtras: Array<{ id: QuoteExtra; cost: number }>
  mountainSupplementPercentage: number
  mountainSupplementAmount: number
  frequencyDiscountAmount: number
  netSubtotal: number
  vatAmount: number
  laborHours: number
  recommendedCleaners: number
  onSiteHours: number
  total: number
}

export type QuoteDraft = QuoteCalculationInput & QuoteCalculation & {
  name: string
  email: string
  phone: string
  description: string
  pricingVersion: string
}

export const airbnbPostalPricing = {
  mountainNpaExact: ['1874', '1875', '1884', '1885', '1936', '1937', '1947', '1948', '3963', '3968', '3992', '3920'],
  mountain: { label: 'Zone Alpe / Station (Premium)', baseFee: 120, hourlyRate: 50 },
  geneva: { label: 'Genève (GE)', baseFee: 80, hourlyRate: 45 },
  vaud: { label: 'Vaud (VD)', baseFee: 70, hourlyRate: 40 },
  lowland: { label: 'Suisse Standard (FR/NE/VS Bas)', baseFee: 60, hourlyRate: 38 },
} as const

export function airbnbPricingForPostalCode(postalCode: string) {
  if (!/^\d{4}$/.test(postalCode)) return null
  const code = Number(postalCode)
  if (airbnbPostalPricing.mountainNpaExact.includes(postalCode as (typeof airbnbPostalPricing.mountainNpaExact)[number])) return airbnbPostalPricing.mountain
  if (code >= 1200 && code <= 1299) return airbnbPostalPricing.geneva
  if ((code >= 1000 && code <= 1199) || (code >= 1300 && code <= 1599)) return airbnbPostalPricing.vaud
  return airbnbPostalPricing.lowland
}

export const quotePricingConfig = {
  cantons: {
    GE: { name: 'Genève', hourlyRate: 42 },
    VD: { name: 'Vaud', hourlyRate: 38 },
    FR: { name: 'Fribourg', hourlyRate: 38 },
    NE: { name: 'Neuchâtel', hourlyRate: 38 },
    VS: { name: 'Valais', hourlyRate: 38 },
  },
  mountainNpaExact: airbnbPostalPricing.mountainNpaExact,
  mountainSupplementPercentage: 0.25,
  vatRate: 0.081,
  prestations: {
    regular: { label: 'Entretien régulier', minutesPerSqm: 3, baseFee: 40 },
    fin_de_bail: { label: 'Fin de bail / Déménagement', minutesPerSqm: 7.5, baseFee: 120 },
    post_travaux: { label: 'Nettoyage après travaux', minutesPerSqm: 6, baseFee: 90 },
    bureaux: { label: 'Bureaux', minutesPerSqm: 2.2, baseFee: 60 },
    clinique: { label: 'Cabinet médical / Clinique', minutesPerSqm: 4.5, baseFee: 100 },
  } satisfies Record<QuotePrestationId, { label: string; minutesPerSqm: number; baseFee: number }>,
  extras: {
    oven: { type: 'fixed', price: 60 },
    fridge: { type: 'fixed', price: 40 },
    windows: { type: 'per_sqm', price: 8 },
    terrace: { type: 'per_sqm', price: 4 },
  } satisfies Record<QuoteExtra, { type: 'fixed' | 'per_sqm'; price: number }>,
  recommendedOnSiteHoursPerCleaner: 4.5,
  billing: {
    baseFlatFeeUnit: 'perVisit',
    mountainSupplementAppliesTo: 'laborOnly',
    vatIncluded: true,
    travelAndMaterialsIncluded: false,
    roundingIncrementChf: 0.05,
    roundingMethod: 'nearest',
    minimumLaborHours: 1,
  },
} as const

const propertyPrestation: Record<QuotePropertyType, QuotePrestationId | null> = {
  apartment: null,
  house: null,
  airbnb: null,
  office: 'bureaux',
  shop: null,
  clinic: 'clinique',
  concierge: null,
}

const servicePrestation: Record<QuoteServiceType, QuotePrestationId> = {
  standard: 'regular',
  endOfTenancy: 'fin_de_bail',
  postConstruction: 'post_travaux',
}

export function cantonFromPostalCode(postalCode: string): QuoteCanton | null {
  if (!/^\d{4}$/.test(postalCode)) return null
  const code = Number(postalCode)
  if (code >= 1200 && code <= 1299) return 'GE'
  if ((code >= 1000 && code <= 1199) || (code >= 1300 && code <= 1599) || (code >= 1600 && code <= 1617) || (code >= 1800 && code <= 1869) || (code >= 1876 && code <= 1899)) return 'VD'
  if (code >= 1618 && code <= 1799) return 'FR'
  if (code >= 2000 && code <= 2499) return 'NE'
  if ((code >= 1870 && code <= 1875) || (code >= 1900 && code <= 1999) || (code >= 3900 && code <= 3999)) return 'VS'
  return null
}

export function mountainSupplementForPostalCode(postalCode: string) {
  if (!/^\d{4}$/.test(postalCode)) return null
  const code = quotePricingConfig.mountainNpaExact.find((entry) => entry === postalCode)
  return code ? { code, supplement_percentage: quotePricingConfig.mountainSupplementPercentage } : null
}

export function resolveQuotePrestation(input: Pick<QuoteCalculationInput, 'property' | 'serviceType' | 'prestationId'>): QuotePrestationId {
  if (input.prestationId) return input.prestationId
  if (input.serviceType !== 'standard') return servicePrestation[input.serviceType]
  return propertyPrestation[input.property] ?? servicePrestation[input.serviceType]
}

function roundToIncrement(value: number) {
  const increment = quotePricingConfig.billing.roundingIncrementChf
  return Number((Math.round((value + Number.EPSILON) / increment) * increment).toFixed(2))
}

function roundToCents(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateQuote(input: QuoteCalculationInput): QuoteCalculation {
  const prestationId = resolveQuotePrestation(input)
  const prestation = quotePricingConfig.prestations[prestationId]
  const isAirbnb = input.property === 'airbnb'
  const bathrooms = input.bathrooms ?? 1
  const laborHours = Math.max(
    quotePricingConfig.billing.minimumLaborHours,
    Math.ceil(input.area * 0.05 + bathrooms * 0.5),
  )
  const airbnbPricing = isAirbnb ? airbnbPricingForPostalCode(input.postalCode) : null
  const isGenevaPostalCode = Number(input.postalCode) >= 1200 && Number(input.postalCode) <= 1299
  const isClinic = input.property === 'clinic' || prestationId === 'clinique'
  const isEndOfTenancy = input.serviceType === 'endOfTenancy' || prestationId === 'fin_de_bail'
  const isConcierge = input.property === 'concierge'
  const hourlyRate = airbnbPricing?.hourlyRate ?? (isGenevaPostalCode ? 42 : 38) + (isClinic ? 5 : 0)
  const baseFlatFee = airbnbPricing?.baseFee ?? (isEndOfTenancy ? 120 : isClinic ? 105 : isConcierge ? 90 : 40)
  const laborCost = laborHours * hourlyRate
  const mountainSupplementPercentage = 0
  const mountainSupplementAmount = 0
  const extrasBreakdown = input.extras.map((id) => {
    const extra = quotePricingConfig.extras[id]
    const cost = extra.type === 'fixed' ? extra.price : input.area * extra.price
    return { id, cost }
  })
  const extrasAmount = extrasBreakdown.reduce((sum, extra) => sum + extra.cost, 0)
  const baseAndLaborSubtotal = baseFlatFee + laborCost
  const rawSubtotal = baseAndLaborSubtotal + mountainSupplementAmount + extrasAmount
  const netSubtotal = roundToIncrement(rawSubtotal)
  const vatAmount = roundToCents(netSubtotal * quotePricingConfig.vatRate)
  const total = roundToIncrement(netSubtotal + vatAmount)
  const recommendedCleaners = Math.max(1, Math.ceil(laborHours / quotePricingConfig.recommendedOnSiteHoursPerCleaner))
  const onSiteHours = Math.ceil((laborHours / recommendedCleaners) * 4) / 4

  return {
    hourlyRate,
    prestationId,
    prestationLabel: airbnbPricing ? `Airbnb · ${airbnbPricing.label}` : prestation.label,
    baseFlatFee,
    laborCost,
    baseAndLaborSubtotal,
    extrasAmount,
    breakdownExtras: extrasBreakdown,
    mountainSupplementPercentage,
    mountainSupplementAmount,
    frequencyDiscountAmount: 0,
    netSubtotal,
    vatAmount,
    laborHours,
    recommendedCleaners,
    onSiteHours,
    total,
  }
}

export function getPostalCantonLabel(postalCode: string): string | null {
  const canton = cantonFromPostalCode(postalCode)
  return canton ? quoteCantons[canton].label : null
}

export function normalizeQuoteInput(input: QuoteCalculationInput): QuoteCalculationInput {
  return {
    ...input,
    area: Math.min(1000, Math.max(20, Math.round(input.area))),
    bathrooms: Math.min(20, Math.max(0, Math.round(input.bathrooms ?? 1))),
    postalCode: input.postalCode.replace(/\D/g, '').slice(0, 4),
    extras: Array.from(new Set(input.extras)),
  }
}

export function createQuoteCalculation(input: QuoteCalculationInput) {
  const normalized = normalizeQuoteInput(input)
  return { input: normalized, calculation: calculateQuote(normalized), pricingVersion: 'swiss-2026-v8-bathroom-hours-region-pricing' }
}
