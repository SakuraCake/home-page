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

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRES_IN = '7d'

export async function createSession(user: User): Promise<string> {
  const payload: UserSession = {
    userId: user.id,
    username: user.username,
    role: user.role || 'user',
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)

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
    const { payload } = await jwtVerify(token, JWT_SECRET)
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
