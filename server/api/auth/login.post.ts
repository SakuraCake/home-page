import { defineEventHandler, readBody } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { users } from '~/database/schema'
import { verifyPassword } from '~/server/utils/auth'
import { createSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    return {
      success: false,
      message: '用户名和密码不能为空'
    }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.username, username)
  })

  if (!user) {
    return {
      success: false,
      message: '用户名或密码错误'
    }
  }

  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    return {
      success: false,
      message: '用户名或密码错误'
    }
  }

  const token = await createSession(user)

  return {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  }
})
