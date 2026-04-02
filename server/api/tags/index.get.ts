import { defineEventHandler } from '#imports'
import { db } from '~/database'
import { tags, articleTags } from '~/database/schema'
import { eq, sql, leftJoin, groupBy } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const tagsWithCount = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
      articleCount: sql<number>`count(${articleTags.articleId})`,
    })
    .from(tags)
    .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
    .groupBy(tags.id)
    .orderBy((tags, { desc }) => [desc(tags.createdAt)])

  return {
    success: true,
    data: tagsWithCount,
  }
})
