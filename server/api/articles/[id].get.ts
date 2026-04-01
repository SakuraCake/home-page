import { defineEventHandler, getHeader, getRouterParam, createError } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { articles, users, categories, tags, articleTags } from '~/database/schema'
import { renderMarkdown } from '~/server/utils/markdown'

export default defineEventHandler(async (event) => {
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

  await db
    .update(articles)
    .set({ viewCount: (article.viewCount || 0) + 1 })
    .where(eq(articles.id, article.id))

  let author = null
  if (article.authorId) {
    const authorData = await db.query.users.findFirst({
      where: eq(users.id, article.authorId),
    })
    if (authorData) {
      author = {
        id: authorData.id,
        username: authorData.username,
        email: authorData.email,
        avatar: authorData.avatar,
        role: authorData.role,
      }
    }
  }

  let category = null
  if (article.categoryId) {
    const categoryData = await db.query.categories.findFirst({
      where: eq(categories.id, article.categoryId),
    })
    if (categoryData) {
      category = categoryData
    }
  }

  const tagRelations = await db.query.articleTags.findMany({
    where: eq(articleTags.articleId, article.id),
  })

  const tagList: typeof tags.$inferSelect[] = []
  for (const relation of tagRelations) {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, relation.tagId),
    })
    if (tag) {
      tagList.push(tag)
    }
  }

  const acceptHeader = getHeader(event, 'Accept') || ''
  const shouldRenderHtml = acceptHeader.includes('text/html')

  const result = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    content: shouldRenderHtml ? renderMarkdown(article.content || '') : article.content,
    contentType: shouldRenderHtml ? 'html' : 'markdown',
    summary: article.summary,
    coverImage: article.coverImage,
    authorId: article.authorId,
    categoryId: article.categoryId,
    status: article.status,
    viewCount: (article.viewCount || 0) + 1,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author,
    category,
    tags: tagList,
  }

  return {
    success: true,
    data: result,
  }
})
