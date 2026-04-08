import { eq } from 'drizzle-orm'
import { db } from '#server/database'
import { articles } from '#server/database/schema'
import { createApiError } from '#server/utils/errors'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { password } = body

  if (!id || isNaN(Number(id))) {
    throw createApiError(400, '无效的文章 ID', 'INVALID_ID')
  }

  if (!password) {
    throw createApiError(400, '请输入密码', 'PASSWORD_REQUIRED')
  }

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, Number(id)),
    columns: {
      id: true,
      password: true,
      visibility: true,
    },
  })

  if (!article) {
    throw createApiError(404, '文章不存在', 'ARTICLE_NOT_FOUND')
  }

  if (article.visibility !== 'password' || !article.password) {
    throw createApiError(400, '该文章不需要密码', 'NO_PASSWORD_REQUIRED')
  }

  if (article.password !== password) {
    throw createApiError(401, '密码错误', 'INVALID_PASSWORD')
  }

  setCookie(event, `article_${article.id}_access`, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return {
    success: true,
    message: '验证成功',
  }
})
