import { defineEventHandler, readBody } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { users } from '~/database/schema'
import { hashPassword } from '~/server/utils/auth'
import { createSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, email } = body

  if (!username || !password) {
    return {
      success: false,
      message: '用户名和密码不能为空'
    }
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username)
  })

  if (existingUser) {
    return {
      success: false,
      message: '用户名已存在'
    }
  }

  const hashedPassword = await hashPassword(password)
  const now = Date.now()

  const result = await db.insert(users).values({
    username,
    password: hashedPassword,
    email: email || null,
    role: 'user',
    createdAt: now,
    updatedAt: now
  }).returning()

  const user = result[0]

  if (!user) {
    return {
      success: false,
      message: '注册失败'
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
