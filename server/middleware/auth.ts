import type { H3Event } from 'h3'
import { defineEventHandler, getRequestURL, createError } from 'h3'
import { getUserSession } from '#server/utils/session'

declare module 'h3' {
  interface H3EventContext {
    user?: {
      userId: number
      username: string
      role: string
    }
  }
}

const PROTECTED_PATHS = [
  '/api/admin',
  '/api/user',
]

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/articles',
  '/api/categories',
  '/api/tags',
]

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(prefix => pathname.startsWith(prefix))
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(prefix => pathname.startsWith(prefix))
}

export default defineEventHandler(async (event: H3Event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  if (!pathname.startsWith('/api/')) {
    return
  }

  if (isPublicPath(pathname)) {
    const session = await getUserSession(event)
    if (session) {
      event.context.user = session
    }
    return
  }

  if (isProtectedPath(pathname)) {
    const session = await getUserSession(event)

    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Authentication required',
      })
    }

    event.context.user = session

    if (pathname.startsWith('/api/admin') && session.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Admin access required',
      })
    }
  }
})
