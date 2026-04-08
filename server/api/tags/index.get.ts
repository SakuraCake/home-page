import { defineEventHandler } from 'h3'
import { db } from '#server/database'
import { sql, eq } from 'drizzle-orm'
import { articleTags } from '#server/database/schema'

export default defineEventHandler(async (_event) => {
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
