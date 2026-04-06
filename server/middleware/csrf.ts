import { verifyCsrfToken } from '../utils/csrf'

const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/captcha/',
  '/api/articles/',
  '/api/categories',
  '/api/tags',
  '/api/config',
]

function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path.startsWith(route))
}

export default defineEventHandler(async (event) => {
  const method = event.method.toUpperCase()
  const path = event.path

  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return
  }

  if (isPublicRoute(path)) {
    return
  }

  await verifyCsrfToken(event)
})
