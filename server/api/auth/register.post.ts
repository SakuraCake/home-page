import { defineEventHandler } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { users } from '~/server/database/schema'
import { hashPassword } from '~/server/utils/auth'
import { createSession } from '~/server/utils/session'
import { validateCaptcha } from '~/server/utils/geetest'
import { validateBody } from '~/server/utils/validation'
import { registerSchema } from '~/server/schemas'
import { authRateLimit } from '~/server/utils/rateLimit'

async function isCaptchaEnabledForRegister(): Promise<boolean> {
  const config = await db.query.captchaConfig.findFirst()
  if (!config) return true
  return (config.enabled ?? true) && (config.registerEnabled ?? true)
}

export default defineEventHandler(async (event) => {
  await authRateLimit(event)

  const body = await validateBody(event, registerSchema)
  const { username, password, email, geetest_challenge, geetest_validate, geetest_seccode } = body

  if (!username || !password) {
    return {
      success: false,
      message: '用户名和密码不能为空'
    }
  }

  const captchaEnabled = await isCaptchaEnabledForRegister()

  if (captchaEnabled) {
    if (!geetest_challenge || !geetest_validate || !geetest_seccode) {
      return {
        success: false,
        message: '请完成验证码验证'
      }
    }

    const captchaResult = await validateCaptcha(event, {
      challenge: geetest_challenge,
      validate: geetest_validate,
      seccode: geetest_seccode,
    })

    if (!captchaResult.success) {
      return {
        success: false,
        message: captchaResult.message || '验证码验证失败'
      }
    }
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username)
  })

  if (existingUser) {
    return {
      success: false,
      message: '用户名已存在'
    }
  }

  const hashedPassword = await hashPassword(password)
  const now = Date.now()

  const result = await db.insert(users).values({
    username,
    password: hashedPassword,
    email: email || null,
    role: 'user',
    createdAt: now,
    updatedAt: now
  }).returning()

  const user = result[0]

  if (!user) {
    return {
      success: false,
      message: '注册失败'
    }
  }

  const token = await createSession(event, user)

  return {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        website: user.website,
        github: user.github,
        twitter: user.twitter,
        weibo: user.weibo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  }
})
