import { defineEventHandler, getRouterParam } from 'h3'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '~/server/database'
import { comments } from '~/server/database/schema'
import { requireAuth } from '~/server/utils/session'
import { defineAbilitiesFor, forbid } from '~/server/utils/abilities'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const ability = defineAbilitiesFor(session)
  const id = parseInt(getRouterParam(event, 'id') || '0')

  if (!id) {
    return {
      success: false,
      message: '无效的评论 ID',
    }
  }

  const comment = await db.query.comments.findFirst({
    where: and(eq(comments.id, id), isNull(comments.deletedAt)),
  })

  if (!comment) {
    return {
      success: false,
      message: '评论不存在',
    }
  }

  if (!ability.can('delete', 'Comment') && comment.userId !== session.userId) {
    forbid()
  }

  const now = Date.now()
  await db
    .update(comments)
    .set({ deletedAt: now })
    .where(eq(comments.id, id))

  return {
    success: true,
    message: '评论已删除',
  }
})
