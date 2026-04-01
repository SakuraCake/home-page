import { defineEventHandler, readBody } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { users } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  const { email, avatar } = body

  const updateData: Record<string, any> = {
    updatedAt: Date.now()
  }

  if (email !== undefined) {
    updateData.email = email || null
  }

  if (avatar !== undefined) {
    updateData.avatar = avatar || null
  }

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, session.userId))
    .returning()

  const updatedUser = result[0]

  if (!updatedUser) {
    return {
      success: false,
      message: '更新失败',
    }
  }

  return {
    success: true,
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    }
  }
})
