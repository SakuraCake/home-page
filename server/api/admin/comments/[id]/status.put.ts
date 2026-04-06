import { defineEventHandler, readBody, getRouterParam } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { comments } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  
  if (session.role !== 'admin') {
    return {
      success: false,
      message: '权限不足',
    }
  }

  const commentId = parseInt(getRouterParam(event, 'id') || '0')
  
  if (!commentId) {
    return {
      success: false,
      message: '无效的评论 ID',
    }
  }

  const body = await readBody(event)
  const { status } = body

  if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
    return {
      success: false,
      message: '无效的状态',
    }
  }

  await db.update(comments)
    .set({ status })
    .where(eq(comments.id, commentId))

  const updatedComment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  })

  return {
    success: true,
    data: updatedComment,
  }
})
