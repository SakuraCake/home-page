import { defineEventHandler, getRouterParam } from 'h3'
import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/database'
import { categories, articles } from '~/server/database/schema'
import { requireAuth } from '~/server/utils/session'
import { defineAbilitiesFor, forbid } from '~/server/utils/abilities'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const ability = defineAbilitiesFor(session)

  if (!ability.can('delete', 'Category')) {
    forbid()
  }

  const id = parseInt(getRouterParam(event, 'id') || '0')

  if (!id) {
    return {
      success: false,
      message: '无效的分类 ID',
    }
  }

  const existingCategory = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  })

  if (!existingCategory) {
    return {
      success: false,
      message: '分类不存在',
    }
  }

  const articleCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.categoryId, id))

  if ((articleCount[0]?.count ?? 0) > 0) {
    return {
      success: false,
      message: '该分类下存在文章，无法删除',
    }
  }

  await db.delete(categories).where(eq(categories.id, id))

  return {
    success: true,
    message: '分类已删除',
  }
})
