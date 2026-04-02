import { defineEventHandler, readBody, getRouterParam } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { comments, articles, siteConfig, captchaConfig } from '~/database/schema'
import { getSession } from '~/server/utils/session'
import { validateCaptcha } from '~/server/utils/geetest'

async function isCaptchaEnabledForComment(): Promise<boolean> {
  const config = await db.query.captchaConfig.findFirst()
  if (!config) return true
  return (config.enabled ?? true) && (config.commentEnabled ?? true)
}

async function needCommentReview(): Promise<boolean> {
  const config = await db.query.siteConfig.findFirst()
  return config?.commentNeedReview ?? false
}

async function isCommentEnabled(): Promise<boolean> {
  const config = await db.query.siteConfig.findFirst()
  return config?.allowComment ?? true
}

export default defineEventHandler(async (event) => {
  const session = await getSession(event)
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

  const commentEnabled = await isCommentEnabled()
  if (!commentEnabled) {
    return {
      success: false,
      message: '评论功能已关闭',
    }
  }

  const body = await readBody(event)
  const { content, parentId, guestName, guestEmail, geetest_challenge, geetest_validate, geetest_seccode } = body

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

  if (!session) {
    if (!guestName || guestName.trim() === '') {
      return {
        success: false,
        message: '请输入昵称',
      }
    }

    const captchaEnabled = await isCaptchaEnabledForComment()

    if (captchaEnabled) {
      if (!geetest_challenge || !geetest_validate || !geetest_seccode) {
        return {
          success: false,
          message: '请完成验证码验证',
        }
      }

      const captchaResult = await validateCaptcha({
        challenge: geetest_challenge,
        validate: geetest_validate,
        seccode: geetest_seccode,
      })

      if (!captchaResult.success) {
        return {
          success: false,
          message: captchaResult.message || '验证码验证失败',
        }
      }
    }
  }

  const needReview = await needCommentReview()
  const isAdmin = session?.role === 'admin'
  const status = (needReview && !isAdmin) ? 'pending' : 'approved'

  const now = Date.now()
  const result = await db
    .insert(comments)
    .values({
      content: content.trim(),
      articleId,
      userId: session?.userId || null,
      guestName: session ? null : guestName.trim(),
      guestEmail: session ? null : (guestEmail?.trim() || null),
      parentId: parentId || null,
      status,
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
    message: needReview && !isAdmin ? '评论已提交，等待审核' : undefined,
  }
})
