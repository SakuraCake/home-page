import { defineEventHandler, getRouterParam } from 'h3'
import { db } from '#server/database'
import { tags, articleTags } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
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

  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, id)
  })

  if (!tag) {
    return {
      success: false,
      message: '标签不存在'
    }
  }

  await db.delete(articleTags).where(eq(articleTags.tagId, id))
  await db.delete(tags).where(eq(tags.id, id))

  return {
    success: true,
    message: '标签已删除'
  }
})
