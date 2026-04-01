import { defineEventHandler, readBody, getRouterParam, createError } from '#imports'
import { eq, isNull } from 'drizzle-orm'
import { db } from '~/database'
import { articles, articleTags } from '~/database/schema'
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

  if (!ability.can('update', article)) {
    forbid()
  }

  const body = await readBody(event)
  const { title, slug, content, summary, coverImage, categoryId, tagIds, status } = body

  if (slug && slug !== article.slug) {
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    })

    if (existingArticle) {
      return {
        success: false,
        message: 'slug 已存在',
      }
    }
  }

  const updateData: Partial<typeof articles.$inferInsert> = {
    updatedAt: Date.now(),
  }

  if (title !== undefined) updateData.title = title
  if (slug !== undefined) updateData.slug = slug
  if (content !== undefined) updateData.content = content
  if (summary !== undefined) updateData.summary = summary
  if (coverImage !== undefined) updateData.coverImage = coverImage
  if (categoryId !== undefined) updateData.categoryId = categoryId ? Number(categoryId) : null
  if (status !== undefined) updateData.status = status

  const result = await db
    .update(articles)
    .set(updateData)
    .where(eq(articles.id, article.id))
    .returning()

  if (tagIds !== undefined && Array.isArray(tagIds)) {
    await db
      .delete(articleTags)
      .where(eq(articleTags.articleId, article.id))

    if (tagIds.length > 0) {
      const tagValues = tagIds.map((tagId: number) => ({
        articleId: article.id,
        tagId: Number(tagId),
      }))
      await db.insert(articleTags).values(tagValues)
    }
  }

  return {
    success: true,
    data: result[0],
  }
})
