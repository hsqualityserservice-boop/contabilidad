import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  cantonFromPostalCode,
  createQuoteCalculation,
  mountainSupplementForPostalCode,
  quotePricingConfig,
  type QuotePrestationId,
  type QuotePropertyType,
  type QuoteServiceType,
} from '@/lib/quote-pricing'

const extrasSchema = z.array(z.enum(['oven', 'fridge', 'windows', 'terrace']))
  .max(4)
  .refine((items) => new Set(items).size === items.length)

const areaSchema = z.union([
  z.number(),
  z.string().trim().regex(/^\d+$/).transform(Number),
]).pipe(z.number().int().min(20).max(1000))

const requestSchema = z.object({
  npa: z.union([z.string(), z.number()])
    .transform((value) => String(value))
    .pipe(z.string().regex(/^\d{4}$/)),
  canton: z.enum(['GE', 'VD', 'FR', 'NE', 'VS']).optional(),
  frequency: z.enum(['oneTime', 'weekly', 'biweekly', 'monthly']).optional(),
  m2: z.number().int().min(20).max(1000).optional(),
  sqm: areaSchema.optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  propertyType: z.enum(['maison', 'appartement', 'airbnb', 'bureaux', 'boutiques', 'cliniques_cabinets', 'conciergerie']).optional(),
  serviceType: z.enum(['regular', 'fin_de_bail', 'post_travaux']).optional(),
  prestationId: z.enum(['regular', 'fin_de_bail', 'post_travaux', 'bureaux', 'clinique']).optional(),
  extras: extrasSchema.optional(),
  selectedExtras: extrasSchema.optional(),
}).strict().superRefine((data, context) => {
  if (data.m2 === undefined && data.sqm === undefined) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide m2 or sqm.' })
  }
  if (data.m2 !== undefined && data.sqm !== undefined && data.m2 !== data.sqm) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'm2 and sqm must match when both are provided.' })
  }
  if (data.extras && data.selectedExtras && (data.extras.length !== data.selectedExtras.length || data.extras.some((extra) => !data.selectedExtras?.includes(extra)))) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'extras and selectedExtras must match when both are provided.' })
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders })
}

const propertyTypes: Record<NonNullable<z.infer<typeof requestSchema>['propertyType']>, QuotePropertyType> = {
  maison: 'house',
  appartement: 'apartment',
  airbnb: 'airbnb',
  bureaux: 'office',
  boutiques: 'shop',
  cliniques_cabinets: 'clinic',
  conciergerie: 'concierge',
}

const serviceTypes: Record<NonNullable<z.infer<typeof requestSchema>['serviceType']>, QuoteServiceType> = {
  regular: 'standard',
  fin_de_bail: 'endOfTenancy',
  post_travaux: 'postConstruction',
}

const prestationServices: Partial<Record<QuotePrestationId, QuoteServiceType>> = {
  regular: 'standard',
  fin_de_bail: 'endOfTenancy',
  post_travaux: 'postConstruction',
  bureaux: 'standard',
  clinique: 'standard',
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonResponse({ error: 'Content-Type debe ser application/json.' }, 415)
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 8_000) return jsonResponse({ error: 'La solicitud es demasiado grande.' }, 413)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'El cuerpo debe ser JSON válido.' }, 400)
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) return jsonResponse({ error: 'Datos de presupuesto no válidos.' }, 400)

  const { npa, canton: requestedCanton, frequency, m2, sqm, propertyType, serviceType, prestationId } = parsed.data
  const area = sqm ?? m2
  if (area === undefined) return jsonResponse({ error: 'Indica la superficie en m².' }, 400)

  const canton = requestedCanton ?? cantonFromPostalCode(npa)
  if (!canton) return jsonResponse({ error: 'El código postal no pertenece a un cantón disponible.' }, 400)

  const resolvedService = prestationId
    ? prestationServices[prestationId] ?? 'standard'
    : serviceType ? serviceTypes[serviceType] : 'standard'
  const resolvedPrestation = prestationId
  const property = propertyType ? propertyTypes[propertyType] : 'apartment'
  const extras = parsed.data.selectedExtras ?? parsed.data.extras ?? []

  const { calculation, pricingVersion } = createQuoteCalculation({
    canton,
    postalCode: npa,
    area,
    bathrooms: parsed.data.bathrooms,
    property,
    serviceType: resolvedService ?? 'standard',
    frequency: frequency ?? 'oneTime',
    extras,
    ...(resolvedPrestation ? { prestationId: resolvedPrestation } : {}),
  })

  const isMountainZone = mountainSupplementForPostalCode(npa) !== null
  const cantonName = quotePricingConfig.cantons[canton].name

  return jsonResponse({
    success: true,
    meta: {
      canton: cantonName,
      codeCanton: canton,
      isMountainZone,
      prestationLabel: calculation.prestationLabel,
    },
    calculation: {
      hoursEstimated: calculation.laborHours,
      baseLaborCost: calculation.laborCost,
      mountainSupplementAmount: calculation.mountainSupplementAmount,
      prestationBaseFee: calculation.baseFlatFee,
      extrasTotal: calculation.extrasAmount,
      breakdownExtras: calculation.breakdownExtras,
      totalLaborCost: calculation.laborCost + calculation.mountainSupplementAmount,
    },
    financial: {
      subtotal: calculation.netSubtotal,
      tva: calculation.vatAmount,
      total: calculation.total,
      currency: 'CHF',
    },
    canton,
    isMountainZone,
    hoursEstimated: calculation.laborHours,
    subtotal: calculation.netSubtotal,
    tva: calculation.vatAmount,
    totalPrice: calculation.total,
    extrasTotal: calculation.extrasAmount,
    mountainSupplement: calculation.mountainSupplementAmount,
    pricingVersion,
  })
}

export function GET() {
  return jsonResponse({ error: 'Método no permitido.' }, 405)
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const maxDuration = 10
