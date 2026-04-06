import { defineEventHandler, readBody, getRouterParam } from 'h3'
import { db } from '~/database'
import { tags } from '~/database/schema'
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
  const { name, slug } = body

  if (!name || !slug) {
    return {
      success: false,
      message: '名称和 slug 不能为空'
    }
  }

  const result = await db
    .update(tags)
    .set({ name, slug })
    .where(eq(tags.id, id))
    .returning()

  return {
    success: true,
    data: result[0]
  }
})
