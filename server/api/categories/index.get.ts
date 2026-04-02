import { defineEventHandler } from '#imports'
import { db } from '~/database'
import { categories, articles } from '~/database/schema'
import { eq, sql, leftJoin, groupBy, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const categoriesWithCount = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      articleCount: sql<number>`count(${articles.id})`,
    })
    .from(categories)
    .leftJoin(articles, eq(categories.id, articles.categoryId))
    .where(isNull(articles.deletedAt))
    .groupBy(categories.id)
    .orderBy((categories, { desc }) => [desc(categories.createdAt)])

  return {
    success: true,
    data: categoriesWithCount,
  }
})
