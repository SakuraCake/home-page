import type { H3Event } from 'h3'
import { getHeader, getCookie, createError } from 'h3'

export function isSecureConnection(event: H3Event): boolean {
  const protocol = getHeader(event, 'x-forwarded-proto') || ''
  if (protocol === 'https') return true

  const socket = event.node.req.socket as any
  return socket?.encrypted === true
}

export async function verifyCsrfToken(event: H3Event): Promise<void> {
  const method = event.method.toUpperCase()

  const safeMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE']
  if (safeMethods.includes(method)) {
    return
  }

  const csrfTokenFromHeader = getHeader(event, 'x-csrf-token')
  const csrfTokenFromBody = event.context.body?.csrfToken
  const csrfTokenFromCookie = getCookie(event, 'csrf_token')

  console.log('[CSRF Debug] Header token:', csrfTokenFromHeader)
  console.log('[CSRF Debug] Cookie token:', csrfTokenFromCookie)

  const csrfToken = csrfTokenFromHeader || csrfTokenFromBody

  if (!csrfToken || !csrfTokenFromCookie) {
    console.log('[CSRF Debug] Missing token - header:', !!csrfToken, 'cookie:', !!csrfTokenFromCookie)
    throw createError({
      statusCode: 403,
      statusMessage: 'CSRF Token Missing',
      message: 'CSRF token is required for this request',
    })
  }

  if (csrfToken !== csrfTokenFromCookie) {
    console.log('[CSRF Debug] Token mismatch')
    throw createError({
      statusCode: 403,
      statusMessage: 'CSRF Token Invalid',
      message: 'Invalid CSRF token',
    })
  }
}

export function getCsrfToken(event: H3Event): string | undefined {
  return getCookie(event, 'csrf_token') || event.context.csrfToken
}
