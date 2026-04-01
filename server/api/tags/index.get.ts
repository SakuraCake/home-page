import { defineEventHandler } from '#imports'
import { db } from '~/database'
import { tags, articleTags } from '~/database/schema'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const allTags = await db.query.tags.findMany({
    orderBy: (tags, { desc }) => [desc(tags.createdAt)],
  })

  const tagsWithCount = await Promise.all(
    allTags.map(async (tag) => {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(articleTags)
        .where(eq(articleTags.tagId, tag.id))

      return {
        ...tag,
        articleCount: count[0]?.count || 0,
      }
    })
  )

  return {
    success: true,
    data: tagsWithCount,
  }
})
