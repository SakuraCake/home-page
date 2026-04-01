import { defineEventHandler } from '#imports'
import { eq, desc, isNull } from 'drizzle-orm'
import { db } from '~/database'
import { comments, articles } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const userComments = await db.query.comments.findMany({
    where: eq(comments.userId, session.userId),
    orderBy: [desc(comments.createdAt)],
    columns: {
      id: true,
      content: true,
      articleId: true,
      createdAt: true
    },
    with: {
      article: {
        columns: {
          id: true,
          title: true
        }
      }
    }
  })

  return {
    success: true,
    data: userComments
  }
})
