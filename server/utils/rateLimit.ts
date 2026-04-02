import type { H3Event } from 'h3'
import { createError } from 'h3'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiters = new Map<string, RateLimiterMemory>()

function getRateLimiter(key: string, maxRequests: number, windowMs: number): RateLimiterMemory {
  if (!rateLimiters.has(key)) {
    rateLimiters.set(key, new RateLimiterMemory({
      points: maxRequests,
      duration: windowMs / 1000,
    }))
  }
  return rateLimiters.get(key)!
}

function getClientIP(event: H3Event): string {
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  if (xForwardedFor && typeof xForwardedFor === 'string') {
    const ip = xForwardedFor.split(',')[0]?.trim()
    return ip || 'unknown'
  }

  const xRealIP = getHeader(event, 'x-real-ip')
  if (xRealIP && typeof xRealIP === 'string') {
    return xRealIP
  }

  return 'unknown'
}

export async function rateLimit(
  event: H3Event,
  options: {
    key?: string
    maxRequests?: number
    windowMs?: number
  } = {}
): Promise<void> {
  const config = useRuntimeConfig(event)
  const {
    key = 'default',
    maxRequests = config.rateLimitMax || 100,
    windowMs = config.rateLimitWindowMs || 900000,
  } = options

  const limiter = getRateLimiter(key, maxRequests, windowMs)
  const clientIP = getClientIP(event)

  try {
    await limiter.consume(clientIP)
  } catch {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: '请求过于频繁，请稍后再试',
    })
  }
}

export async function strictRateLimit(event: H3Event): Promise<void> {
  await rateLimit(event, {
    key: 'strict',
    maxRequests: 5,
    windowMs: 60000,
  })
}

export async function authRateLimit(event: H3Event): Promise<void> {
  await rateLimit(event, {
    key: 'auth',
    maxRequests: 10,
    windowMs: 900000,
  })
}

export async function apiRateLimit(event: H3Event): Promise<void> {
  await rateLimit(event, {
    key: 'api',
    maxRequests: 100,
    windowMs: 900000,
  })
}
