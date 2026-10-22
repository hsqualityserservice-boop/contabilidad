import { createHash } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let limiter: Ratelimit | undefined

type RateLimitResult =
  | { status: 'allowed'; remaining: number | null }
  | { status: 'limited'; remaining: number; reset: number }
  | { status: 'unavailable' }

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const proxyIp = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim()
  return proxyIp || 'unknown'
}

export async function checkQuoteRateLimit(request: Request): Promise<RateLimitResult> {
  const hasCredentials = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  )

  if (!hasCredentials) {
    return process.env.NODE_ENV === 'production'
      ? { status: 'unavailable' }
      : { status: 'allowed', remaining: null }
  }

  try {
    limiter ??= new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      prefix: 'hs-quality:quote-assistant',
    })

    const ip = getClientIp(request)
    const identifier = createHash('sha256').update(ip).digest('hex')
    const result = await limiter.limit(identifier, {
      ip,
      userAgent: request.headers.get('user-agent') ?? undefined,
      country: request.headers.get('x-vercel-ip-country') ?? undefined,
    })

    return result.success
      ? { status: 'allowed', remaining: result.remaining }
      : { status: 'limited', remaining: result.remaining, reset: result.reset }
  } catch (error) {
    console.error('[quote-assistant] Shared rate limiter unavailable', error)
    return process.env.NODE_ENV === 'production'
      ? { status: 'unavailable' }
      : { status: 'allowed', remaining: null }
  }
}

export function getQuoteRateLimitHeaders(remaining: number | null) {
  return remaining === null ? {} : { 'X-RateLimit-Remaining': String(remaining) }
}

export function getRetryAfterSeconds(reset: number) {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000))
}

export const QUOTE_RATE_LIMIT = '5 requests per minute'

export function unavailableRateLimitResponse() {
  return Response.json(
    { error: 'Quote service is temporarily unavailable. Please try again shortly.' },
    { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '30' } },
  )
}

export function limitedRateResponse(reset: number, remaining: number) {
  return Response.json(
    { error: 'Too many requests. Please try again shortly.' },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(getRetryAfterSeconds(reset)),
        'X-RateLimit-Remaining': String(remaining),
      },
    },
  )
}
