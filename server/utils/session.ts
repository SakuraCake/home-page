import type { H3Event } from 'h3'
import { getHeader, getCookie, setCookie, createError } from 'h3'
import { jwtVerify, SignJWT } from 'jose'
import type { users } from '#server/database/schema'

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

function getJwtExpiresIn(event: H3Event): number {
  const config = useRuntimeConfig(event)
  return config.sessionMaxAge || 604800
}

function isSecureConnection(event: H3Event): boolean {
  const protocol = getHeader(event, 'x-forwarded-proto') || ''
  if (protocol === 'https') return true

  const socket = event.node.req.socket as any
  return socket?.encrypted === true
}

export async function createSession(event: H3Event, user: User, rememberMe: boolean = false): Promise<string> {
  const payload: UserSession = {
    userId: user.id,
    username: user.username,
    role: user.role || 'user',
  }

  const secret = getJwtSecret(event)
  const maxAge = getJwtExpiresIn(event)
  const cookieMaxAge = rememberMe ? maxAge * 4 : maxAge
  const expiresIn = `${Math.floor(cookieMaxAge / 86400)}d`

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)

  const secure = isSecureConnection(event)

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: secure,
    sameSite: 'lax',
    maxAge: cookieMaxAge,
    path: '/',
  })

  const csrfToken = crypto.randomUUID()
  setCookie(event, 'csrf_token', csrfToken, {
    httpOnly: false,
    secure: secure,
    sameSite: 'lax',
    maxAge: cookieMaxAge,
    path: '/',
  })

  event.context.csrfToken = csrfToken

  return token
}

export async function getUserSession(event: H3Event): Promise<UserSession | null> {
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
  const session = await getUserSession(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required',
    })
  }

  return session
}
