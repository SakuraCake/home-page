import { defineEventHandler, readBody, getHeader } from '#imports'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { users, captchaConfig } from '~/database/schema'
import { verifyPassword } from '~/server/utils/auth'
import { createSession } from '~/server/utils/session'
import { validateCaptcha } from '~/server/utils/geetest'
import { validateBody } from '~/server/utils/validation'
import { loginSchema } from '~/server/schemas'
import { authRateLimit } from '~/server/utils/rateLimit'

async function isCaptchaEnabledForLogin(): Promise<boolean> {
  const config = await db.query.captchaConfig.findFirst()
  if (!config) return true
  return (config.enabled ?? true) && (config.loginEnabled ?? true)
}

export default defineEventHandler(async (event) => {
  await authRateLimit(event)

  const body = await validateBody(event, loginSchema)
  const { username, password, geetest_challenge, geetest_validate, geetest_seccode } = body

  const captchaEnabled = await isCaptchaEnabledForLogin()

  if (captchaEnabled) {
    if (!geetest_challenge || !geetest_validate || !geetest_seccode) {
      return {
        success: false,
        message: '请完成验证码验证'
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
        message: captchaResult.message || '验证码验证失败'
      }
    }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.username, username)
  })

  if (!user) {
    return {
      success: false,
      message: '用户名或密码错误'
    }
  }

  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    return {
      success: false,
      message: '用户名或密码错误'
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  }
})
