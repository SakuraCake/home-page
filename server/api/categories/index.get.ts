import { defineEventHandler } from 'h3'
import { db } from '~/server/database'
import { sql, eq } from 'drizzle-orm'
import { articles } from '~/server/database/schema'

export default defineEventHandler(async (_event) => {
  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { desc }) => [desc(categories.createdAt)],
  })

  const categoriesWithCount = await Promise.all(
    allCategories.map(async (category) => {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(eq(articles.categoryId, category.id))

      return {
        ...category,
        articleCount: count[0]?.count || 0,
      }
    })
  )

  return {
    success: true,
    data: categoriesWithCount,
  }
})
