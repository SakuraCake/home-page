import { defineEventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '#server/database'
import { users } from '#server/database/schema'
import { getUserSession } from '#server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '请先登录'
    })
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId)
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: '用户不存在'
    })
  }

  return {
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      website: user.website,
      github: user.github,
      twitter: user.twitter,
      weibo: user.weibo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
})
