import { defineCachedEventHandler, getHeader } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { users } from '~/database/schema'
import { verifyToken } from '~/server/utils/auth'
import { AppError } from '~/server/utils/errors'

export default defineCachedEventHandler(async (event) => {
  const authorization = getHeader(event, 'Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw AppError.unauthorized('未授权')
  }

  const token = authorization.replace('Bearer ', '')
  const payload = await verifyToken(token)

  if (!payload) {
    throw AppError.unauthorized('无效的 token')
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId)
  })

  if (!user) {
    throw AppError.notFound('用户不存在')
  }

  return {
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}, {
  maxAge: 60 * 5,
  swr: true,
  staleMaxAge: 60 * 10,
  varies: ['Authorization'],
  getKey: (event) => {
    const authorization = getHeader(event, 'Authorization') || ''
    return `user:me:${authorization}`
  },
  shouldBypassCache: async (event) => {
    // 当用户更新个人信息时，应该绕过缓存
    const headers = getHeader(event, 'X-No-Cache')
    return headers === 'true'
  },
})
