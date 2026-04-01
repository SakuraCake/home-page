import { defineEventHandler, getHeader } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { users } from '~/database/schema'
import { verifyToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, 'Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return {
      success: false,
      message: '未授权'
    }
  }

  const token = authorization.replace('Bearer ', '')
  const payload = await verifyToken(token)

  if (!payload) {
    return {
      success: false,
      message: '无效的 token'
    }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId)
  })

  if (!user) {
    return {
      success: false,
      message: '用户不存在'
    }
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
})
