import { z } from 'zod'

const CONFIG = {
  cantons: {
    GE: { name: 'Genève' },
    VD: { name: 'Vaud' },
    FR: { name: 'Fribourg' },
    NE: { name: 'Neuchâtel' },
    VS: { name: 'Valais' },
  },
  mountainNpas: [1874, 1875, 1884, 1885, 1936, 1937, 1947, 1948, 3963, 3968, 3992, 3920],
  hourlyRates: {
    particular: 48,
    airbnb: 48,
    fin_de_bail: 52,
    fin_travaux: 58,
    professional: 50,
    clinique: 65,
  },
  extras: { oven: 60, fridge: 40, laundryForfait: 50, greaseWallSpecial: 70, vitrineRatePerM2: 12 },
} as const

const DICTIONARY = {
  professional: ['magasin', 'magasins', 'boutique', 'boutiques', 'bureau', 'bureaux', 'vitrine', 'vitrines', 'commerce', 'commerces', 'clinique', 'cliniques', 'cabinet', 'cabinets', 'entreprise', 'entreprises', 'société', 'societe', 'sociétés', 'societes', 'office', 'offices', 'shop', 'shops', 'business', 'company', 'clinic', 'practice'],
  airbnb: ['airbnb', 'location courte durée', 'alquiler vacacional', 'chaque location', 'saisonnier', 'holiday rental', 'short-term rental'],
  finDeBail: ['fin de bail', 'déménagement', 'restitution', 'état des lieux', 'fianza', 'entrega', 'end of lease', 'move out'],
  clinique: ['clinique', 'médical', 'cabinet médical', 'dentiste', 'physio', 'medical', 'dentist'],
  laundry: ['sábanas', 'sabanas', 'draps', 'serviettes', 'linge', 'blanchisserie', 'lavar', 'laundry', 'bed sheets', 'towels', 'wash'],
  deepClean: ['a fondo', 'à fond', 'profondeur', 'gros nettoyage', 'intense', 'deep clean', 'deep cleaning', 'limpieza profunda'],
  oven: ['four', 'cuisinière', 'cuisiniere', 'cuisine électrique', 'cuisine electrique', 'oven', 'stove', 'horno'],
  fridge: ['frigo', 'frigorifique', 'réfrigérateur', 'refrigerateur', 'nevera', 'fridge', 'refrigerator'],
  greaseWall: ['mur de la cocina', 'muro de la cocina', 'muro de cocina', 'graisse', 'grasa', 'huile', 'taches de graisse', 'manchas de grasa', 'grease', 'oil'],
  glass: ['vitrine', 'vitre', 'window', 'ventana'],
} as const

const CANTON_BY_NPA = [
  { min: 1200, max: 1299, canton: 'GE' },
  { min: 1000, max: 1199, canton: 'VD' },
  { min: 1300, max: 1599, canton: 'VD' },
  { min: 1600, max: 1799, canton: 'FR' },
  { min: 2000, max: 2499, canton: 'NE' },
  { min: 1800, max: 1999, canton: 'VS' },
] as const

type CantonKey = keyof typeof CONFIG.cantons
type PrestationKey = keyof typeof CONFIG.hourlyRates

type ServiceType = 'particular' | 'professional' | 'airbnb' | 'fin_de_bail' | 'fin_travaux' | 'clinique'

type SectorKey = 'particular' | 'professional' | 'airbnb'

function hasKeyword(text: string, keywords: readonly string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

function getCanton(npa: number): CantonKey {
  return CANTON_BY_NPA.find(({ min, max }) => npa >= min && npa <= max)?.canton ?? 'FR'
}

function extractArea(text: string, terms: string) {
  const area = String.raw`(\d+(?:[.,]\d+)?)\s*(?:m2|m²)`
  const before = text.match(new RegExp(String.raw`(?:${terms})\s*(?:(?:de|d['’]|of)\s*)?${area}`, 'i'))
  const after = text.match(new RegExp(String.raw`${area}\s*(?:(?:de|d['’]|of)\s*)?(?:${terms})`, 'i'))
  return Number((before ?? after)?.[1]?.replace(',', '.') ?? 0)
}

function extractCount(text: string, terms: string) {
  const match = text.match(new RegExp(String.raw`(\d+)\s*(?:${terms})`, 'i'))
  return match ? Math.min(200, Number.parseInt(match[1], 10)) : 0
}

function roundSwiss(amount: number) {
  return Math.round(amount * 20) / 20
}

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100
}

const requestSchema = z.object({
  textDescription: z.string().trim().min(1).max(1000),
  serviceType: z.enum(['particular', 'professional', 'airbnb', 'fin_de_bail', 'fin_travaux', 'clinique']).optional(),
  npa: z.union([z.string(), z.number()]).optional(),
  sqm: z.union([z.string(), z.number()]).optional(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store',
}

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders })
}


export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonResponse({ success: false, error: 'Content-Type must be application/json.' }, 415)
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 8_000) return jsonResponse({ success: false, error: 'Request is too large.' }, 413)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, error: 'Invalid request body.' }, 400)
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) return jsonResponse({ success: false, error: 'Description or quote details are invalid.' }, 400)

  const { textDescription } = parsed.data
  const textLower = textDescription.toLocaleLowerCase()
  const rawNpa = parsed.data.npa === undefined ? '1200' : String(parsed.data.npa).trim()
  if (!/^\d{4}$/.test(rawNpa)) return jsonResponse({ success: false, error: 'NPA must contain four digits.' }, 400)

  const rawSurface = parsed.data.sqm === undefined ? 50 : Number(parsed.data.sqm)
  if (!Number.isFinite(rawSurface) || rawSurface < 1 || rawSurface > 1000) {
    return jsonResponse({ success: false, error: 'Surface must be between 1 and 1000 m².' }, 400)
  }

  const npaNum = Number.parseInt(rawNpa, 10)
  const detectedSector: SectorKey = hasKeyword(textLower, DICTIONARY.professional)
    ? 'professional'
    : 'particular'
  let sector: SectorKey = detectedSector
  let prestationKey: PrestationKey = detectedSector
  if (hasKeyword(textLower, DICTIONARY.airbnb)) {
    sector = 'airbnb'
    prestationKey = 'airbnb'
  }
  if (hasKeyword(textLower, DICTIONARY.finDeBail)) prestationKey = 'fin_de_bail'
  if (hasKeyword(textLower, DICTIONARY.clinique)) {
    sector = 'professional'
    prestationKey = 'clinique'
  }

  const selectedService = parsed.data.serviceType
  if (selectedService === 'particular') {
    sector = 'particular'
    prestationKey = 'particular'
  } else if (selectedService === 'professional') {
    sector = 'professional'
    prestationKey = 'professional'
  } else if (selectedService === 'airbnb') {
    sector = 'airbnb'
    prestationKey = 'airbnb'
  } else if (selectedService === 'fin_de_bail' || selectedService === 'fin_travaux') {
    sector = detectedSector
    prestationKey = selectedService
  } else if (selectedService === 'clinique') {
    sector = 'professional'
    prestationKey = 'clinique'
  }

  const detectedRooms = extractCount(textLower, 'pièces?|chambres?|hab(?:itación|itaciones)?|rooms?')
  const detectedBathrooms = extractCount(textLower, 'bains?|douches?|wc|baños?|bathrooms?|showers?')
  const extractedVitrineSqm = extractArea(textLower, 'vitrines?|vitres?|windows?|ventanas?')
  const mentionsGlass = hasKeyword(textLower, DICTIONARY.glass)
  const needsLaundry = hasKeyword(textLower, DICTIONARY.laundry)
  const hasDeepClean = hasKeyword(textLower, DICTIONARY.deepClean)
  const hasOven = hasKeyword(textLower, DICTIONARY.oven)
  const hasFridge = hasKeyword(textLower, DICTIONARY.fridge)
  const hasGreaseWall = hasKeyword(textLower, DICTIONARY.greaseWall)

  const cantonKey = getCanton(npaNum)
  const canton = CONFIG.cantons[cantonKey]
  const isMountain = (CONFIG.mountainNpas as readonly number[]).includes(npaNum)
  const recommendedPeople = rawSurface > 120 || prestationKey === 'fin_de_bail' || prestationKey === 'fin_travaux'
    ? rawSurface > 120 ? 3 : 2
    : 1
  const durationDivisor = prestationKey === 'fin_de_bail' ? 20 : prestationKey === 'fin_travaux' ? 15 : 25
  const estimatedHours = rawSurface / durationDivisor
  const totalLaborHours = estimatedHours * recommendedPeople
  const hourlyRatePerWorker = CONFIG.hourlyRates[prestationKey]
  const isMicroVitrineService = rawSurface <= 15 && mentionsGlass
  let subtotal = totalLaborHours * hourlyRatePerWorker

  if (needsLaundry || sector === 'airbnb') subtotal += CONFIG.extras.laundryForfait
  if (hasOven) subtotal += CONFIG.extras.oven
  if (hasFridge) subtotal += CONFIG.extras.fridge
  if (hasGreaseWall) subtotal += CONFIG.extras.greaseWallSpecial
  if (extractedVitrineSqm > 0) subtotal += extractedVitrineSqm * CONFIG.extras.vitrineRatePerM2
  if (isMicroVitrineService) subtotal += 30

  const finalSubtotal = roundSwiss(subtotal)
  const tva = roundCurrency(finalSubtotal * 0.081)
  const total = roundSwiss(finalSubtotal + tva)
  return jsonResponse({
    success: true,
    analysis: {
      sector,
      prestation: prestationKey === 'fin_de_bail' ? 'fin_de_bail' : prestationKey === 'fin_travaux' ? 'fin_travaux' : prestationKey === 'clinique' ? 'clinique' : 'standard',
      canton: canton.name,
      cantonCode: cantonKey,
      isMountain,
      hourlyRatePerWorker,
      recommendedPeople,
      totalLaborHours,
      detectedRooms,
      detectedBathrooms,
      extractedVitrineSqm,
      isMicroVitrineService,
      isDeepClean: hasDeepClean,
      needsLaundry: needsLaundry || sector === 'airbnb',
      extrasFound: { oven: hasOven, fridge: hasFridge, greaseWall: hasGreaseWall },
    },
    pricing: {
      hoursEstimated: estimatedHours,
      subtotal: finalSubtotal,
      tva,
      total,
      currency: 'CHF',
    },
  })
}

export function GET() {
  return jsonResponse({ error: 'Method not allowed.' }, 405)
}

export function PUT() {
  return jsonResponse({ error: 'Method not allowed.' }, 405)
}

export function PATCH() {
  return jsonResponse({ error: 'Method not allowed.' }, 405)
}

export function DELETE() {
  return jsonResponse({ error: 'Method not allowed.' }, 405)
}

export function HEAD() {
  return new Response(null, { status: 405, headers: corsHeaders })
}
