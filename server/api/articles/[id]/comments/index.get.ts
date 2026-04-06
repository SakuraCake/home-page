import { defineEventHandler, getRouterParam, getQuery } from 'h3'
import { eq, and, desc, isNull } from 'drizzle-orm'
import { db } from '~/database'
import { comments } from '~/database/schema'
import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const articleId = parseInt(getRouterParam(event, 'id') || '0')
  const query = getQuery(event)
  const includeDeleted = query.includeDeleted === 'true'
  const isAdmin = session?.role === 'admin'

  if (!articleId) {
    return {
      success: false,
      message: '无效的文章 ID',
    }
  }

  const whereConditions = [eq(comments.articleId, articleId)]

  if (!includeDeleted) {
    whereConditions.push(isNull(comments.deletedAt))
  }

  if (!isAdmin) {
    whereConditions.push(eq(comments.status, 'approved'))
  }

  const allComments = await db.query.comments.findMany({
    where: and(...whereConditions),
    orderBy: [desc(comments.createdAt)],
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

  const commentsMap = new Map()
  const rootComments: any[] = []

  allComments.forEach((comment) => {
    commentsMap.set(comment.id, {
      ...comment,
      replies: [],
    })
  })

  allComments.forEach((comment) => {
    const commentWithReplies = commentsMap.get(comment.id)
    if (comment.parentId) {
      const parent = commentsMap.get(comment.parentId)
      if (parent) {
        parent.replies.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return {
    success: true,
    data: rootComments,
  }
})
