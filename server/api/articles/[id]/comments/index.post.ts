import { defineEventHandler, readBody, getRouterParam } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { comments, articles } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const articleId = parseInt(getRouterParam(event, 'id') || '0')

  if (!articleId) {
    return {
      success: false,
      message: '无效的文章 ID',
    }
  }

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, articleId),
  })

  if (!article) {
    return {
      success: false,
      message: '文章不存在',
    }
  }

  const body = await readBody(event)
  const { content, parentId } = body

  if (!content || content.trim() === '') {
    return {
      success: false,
      message: '评论内容不能为空',
    }
  }

  if (parentId) {
    const parentComment = await db.query.comments.findFirst({
      where: eq(comments.id, parentId),
    })

    if (!parentComment) {
      return {
        success: false,
        message: '父评论不存在',
      }
    }
  }

  const now = Date.now()
  const result = await db
    .insert(comments)
    .values({
      content: content.trim(),
      articleId,
      userId: session.userId,
      parentId: parentId || null,
      createdAt: now,
    })
    .returning()

  const insertedId = result[0]?.id
  if (!insertedId) {
    return {
      success: false,
      message: '评论创建失败',
    }
  }

  const newComment = await db.query.comments.findFirst({
    where: eq(comments.id, insertedId),
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  })

  return {
    success: true,
    data: newComment,
  }
})
