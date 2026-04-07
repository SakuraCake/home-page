import { defineEventHandler, readBody } from 'h3'
import { db } from '~/server/database'
import { captchaConfig } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  
  if (session.role !== 'admin') {
    return {
      success: false,
      message: '权限不足',
    }
  }

  const body = await readBody(event)
  const { enabled, provider, siteKey, secretKey, loginEnabled, registerEnabled, commentEnabled } = body

  let config = await db.query.captchaConfig.findFirst()
  const now = Date.now()

  if (config) {
    await db.update(captchaConfig)
      .set({
        enabled: enabled ?? config.enabled,
        provider: provider ?? config.provider,
        siteKey: siteKey ?? config.siteKey,
        secretKey: secretKey ?? config.secretKey,
        loginEnabled: loginEnabled ?? config.loginEnabled,
        registerEnabled: registerEnabled ?? config.registerEnabled,
        commentEnabled: commentEnabled ?? config.commentEnabled,
        updatedAt: now,
      })
      .where(eq(captchaConfig.id, config.id))
  } else {
    await db.insert(captchaConfig).values({
      enabled: enabled ?? true,
      provider: provider ?? 'geetest',
      siteKey: siteKey ?? '',
      secretKey: secretKey ?? '',
      loginEnabled: loginEnabled ?? true,
      registerEnabled: registerEnabled ?? true,
      commentEnabled: commentEnabled ?? true,
      updatedAt: now,
    })
  }

  config = await db.query.captchaConfig.findFirst()

  return {
    success: true,
    data: {
      enabled: config?.enabled ?? true,
      provider: config?.provider ?? 'geetest',
      siteKey: config?.siteKey ?? '',
      secretKey: config?.secretKey ?? '',
      loginEnabled: config?.loginEnabled ?? true,
      registerEnabled: config?.registerEnabled ?? true,
      commentEnabled: config?.commentEnabled ?? true,
    },
  }
})
