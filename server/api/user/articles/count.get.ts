import { defineEventHandler } from '#imports'
import { eq, sql } from 'drizzle-orm'
import { db } from '~/database'
import { articles } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.authorId, session.userId))

  return {
    success: true,
    data: {
      count: result[0]?.count || 0
    }
  }
})
