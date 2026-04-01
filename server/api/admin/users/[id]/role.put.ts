import { defineEventHandler, readBody, getRouterParam } from '#imports'
import { db } from '~/database'
import { users } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  if (session.role !== 'admin') {
    return {
      success: false,
      message: '需要管理员权限'
    }
  }

  const id = parseInt(getRouterParam(event, 'id') || '0')
  const body = await readBody(event)
  const { role } = body

  if (!['admin', 'user'].includes(role)) {
    return {
      success: false,
      message: '无效的角色'
    }
  }

  await db
    .update(users)
    .set({ role, updatedAt: Date.now() })
    .where(eq(users.id, id))

  return {
    success: true,
    message: '角色已更新'
  }
})
