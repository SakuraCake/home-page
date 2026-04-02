import type { H3Event } from 'h3'
import { getHeader, getCookie, createError } from 'h3'
import { jwtVerify, SignJWT } from 'jose'
import type { users } from '~/database/schema'

export interface UserSession {
  userId: number
  username: string
  role: string
  [key: string]: unknown
}

type User = typeof users.$inferSelect
  
const JWT_ALGORITHM = 'HS256'

function getJwtSecret(event: H3Event): Uint8Array {
  const config = useRuntimeConfig(event)
  const secret = config.jwtSecret
  
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Configuration Error',
      message: 'JWT secret is not configured',
    })
  }
  
  if (secret.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Configuration Error',
      message: 'JWT secret must be at least 32 characters long',
    })
  }
  
  return new TextEncoder().encode(secret)
}

function getJwtExpiresIn(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const maxAge = config.sessionMaxAge || 604800
  const days = Math.floor(maxAge / 86400)
  return `${days}d`
}

export async function createSession(event: H3Event, user: User): Promise<string> {
  const payload: UserSession = {
    userId: user.id,
    username: user.username,
    role: user.role || 'user',
  }

  const secret = getJwtSecret(event)
  const expiresIn = getJwtExpiresIn(event)

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)

  return token
}

export async function getSession(event: H3Event): Promise<UserSession | null> {
  let token = getHeader(event, 'Authorization')

  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7)
  } else {
    token = getCookie(event, 'auth_token') || undefined
  }

  if (!token) {
    return null
  }

  try {
    const secret = getJwtSecret(event)
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as UserSession
  } catch {
    return null
  }
}

export async function requireAuth(event: H3Event): Promise<UserSession> {
  const session = await getSession(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required',
    })
  }

  return session
}
