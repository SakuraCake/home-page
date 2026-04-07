import { defineEventHandler } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { articles, articleTags } from '~/server/database/schema'
import { requireAuth } from '~/server/utils/session'
import { defineAbilitiesFor, forbid } from '~/server/utils/abilities'
import { validateBody } from '~/server/utils/validation'
import { articleSchema } from '~/server/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const ability = defineAbilitiesFor(session)

  if (!ability.can('create', 'Article')) {
    forbid()
  }

  const body = await validateBody(event, articleSchema)
  const { title, slug, content, summary, coverImage, categoryId, tagIds, status } = body

  if (!title || !slug) {
    return {
      success: false,
      message: '标题和 slug 不能为空',
    }
  }

  const existingArticle = await db.query.articles.findFirst({
    where: eq(articles.slug, slug),
  })

  if (existingArticle) {
    return {
      success: false,
      message: 'slug 已存在',
    }
  }

  const now = Date.now()
  const result = await db.insert(articles).values({
    title,
    slug,
    content: content || '',
    summary: summary || '',
    coverImage: coverImage || null,
    authorId: session.userId,
    categoryId: categoryId ? Number(categoryId) : null,
    status: status || 'draft',
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }).returning()

  const article = result[0]

  if (!article) {
    return {
      success: false,
      message: '文章创建失败',
    }
  }

  if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
    const tagValues = tagIds.map((tagId: number) => ({
      articleId: article.id,
      tagId: Number(tagId),
    }))
    await db.insert(articleTags).values(tagValues)
  }

  return {
    success: true,
    data: article,
  }
})
