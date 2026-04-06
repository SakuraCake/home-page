import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { articles } from '~/database/schema'
import { renderMarkdown } from '~/server/utils/markdown'
import { getUserSession } from '~/server/utils/session'
import { incrementViewCount } from '~/server/utils/viewCount'
import { createApiError } from '~/server/utils/errors'

export default defineCachedEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createApiError(400, '无效的文章 ID', 'INVALID_ID')
  }

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, Number(id)),
    with: {
      author: {
        columns: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
        },
      },
      category: true,
      articleTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  if (!article || article.deletedAt) {
    throw createApiError(404, '文章不存在', 'ARTICLE_NOT_FOUND')
  }

  const session = await getUserSession(event)
  const isAdmin = session?.role === 'admin'
  const isLoggedIn = !!session
  const now = Date.now()

  if (article.status !== 'published' && !isAdmin) {
    throw createApiError(404, '文章不存在', 'ARTICLE_NOT_FOUND')
  }

  if (article.publishAt && article.publishAt > now && !isAdmin) {
    throw createApiError(404, '文章不存在', 'ARTICLE_NOT_FOUND')
  }

  if (article.visibility === 'private' && !isLoggedIn) {
    throw createApiError(403, '需要登录后查看', 'LOGIN_REQUIRED')
  }

  const isPasswordProtected = article.visibility === 'password' && article.password
  const passwordVerified = getCookie(event, `article_${article.id}_access`) === 'true'

  const tags = article.articleTags.map((at) => at.tag)

  if (isPasswordProtected && !passwordVerified && !isAdmin) {
    return {
      success: true,
      data: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        coverImage: article.coverImage,
        status: article.status,
        visibility: article.visibility,
        hasPassword: true,
        viewCount: article.viewCount,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        author: article.author,
        category: article.category,
        tags,
        content: null,
        needsPassword: true,
      },
    }
  }

  await incrementViewCount(article.id, event)

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
    visibility: article.visibility,
    hasPassword: !!article.password,
    viewCount: (article.viewCount || 0) + 1,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    publishAt: article.publishAt,
    author: article.author,
    category: article.category,
    tags,
    needsPassword: false,
  }

  return {
    success: true,
    data: result,
  }
}, {
  maxAge: 60 * 5,
  swr: true,
  staleMaxAge: 60 * 10,
  varies: ['Accept', 'Authorization', 'Cookie'],
  getKey: async (event) => {
    const id = getRouterParam(event, 'id')
    const acceptHeader = getHeader(event, 'Accept') || ''
    const shouldRenderHtml = acceptHeader.includes('text/html')
    const accessCookie = getCookie(event, `article_${id}_access`)
    const hasAccess = accessCookie === 'true'

    const session = await getUserSession(event)
    const userType = session ? 'user' : 'guest'

    return `article:${id}:${shouldRenderHtml ? 'html' : 'md'}:${hasAccess}:${userType}`
  },
})
