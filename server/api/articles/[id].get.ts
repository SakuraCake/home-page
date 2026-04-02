import { defineCachedEventHandler } from '#imports'
import { eq, inArray } from 'drizzle-orm'
import { db } from '~/database'
import { articles, users, categories, tags, articleTags } from '~/database/schema'
import { renderMarkdown } from '~/server/utils/markdown'
import { getSession } from '~/server/utils/session'
import { incrementViewCount } from '~/server/utils/viewCount'

export default defineCachedEventHandler(async (event) => {
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

  const session = await getSession(event)
  const isAdmin = session?.role === 'admin'

  if (article.status !== 'published' && !isAdmin) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: '文章不存在',
    })
  }

  await incrementViewCount(article.id, event)

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

  const tagIds = tagRelations.map(r => r.tagId)
  const tagList: typeof tags.$inferSelect[] = []

  if (tagIds.length > 0) {
    const tagsData = await db.query.tags.findMany({
      where: inArray(tags.id, tagIds),
    })
    tagList.push(...tagsData)
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
}, {
  maxAge: 60 * 5,
  swr: true,
  staleMaxAge: 60 * 10,
  varies: ['Accept', 'Authorization'],
  getKey: (event) => {
    const id = getRouterParam(event, 'id')
    const acceptHeader = getHeader(event, 'Accept') || ''
    const shouldRenderHtml = acceptHeader.includes('text/html')
    return `article:${id}:${shouldRenderHtml ? 'html' : 'md'}`
  },
  shouldBypassCache: async (event) => {
    const session = await getSession(event)
    return session?.role === 'admin'
  },
})
