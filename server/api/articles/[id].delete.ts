import { defineEventHandler, getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { articles } from '~/server/database/schema'
import { requireAuth } from '~/server/utils/session'
import { defineAbilitiesFor, forbid } from '~/server/utils/abilities'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const ability = defineAbilitiesFor(session)

  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '无效的文章 ID',
    })
  }

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, Number(id)),
  })

  if (!article || article.deletedAt) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: '文章不存在',
    })
  }

  if (!ability.can('delete', article)) {
    forbid()
  }

  await db
    .update(articles)
    .set({ deletedAt: Date.now() })
    .where(eq(articles.id, article.id))

  return {
    success: true,
    message: '文章已删除',
  }
})
