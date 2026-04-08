import { defineEventHandler } from 'h3'
import { db } from '#server/database'
import { users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  if (session.role !== 'admin') {
    return {
      success: false,
      message: '需要管理员权限'
    }
  }

  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
    columns: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return {
    success: true,
    data: allUsers
  }
})
