import { defineEventHandler } from '#imports'
import { eq, desc, isNull } from 'drizzle-orm'
import { db } from '~/database'
import { articles } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const userArticles = await db.query.articles.findMany({
    where: (articles, { eq, and, isNull }) => and(
      eq(articles.authorId, session.userId),
      isNull(articles.deletedAt)
    ),
    orderBy: [desc(articles.createdAt)],
    columns: {
      id: true,
      title: true,
      summary: true,
      coverImage: true,
      status: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return {
    success: true,
    data: userArticles
  }
})
