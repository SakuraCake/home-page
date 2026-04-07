import { defineEventHandler } from 'h3'
import { db } from '~/server/database'
import { captchaConfig } from '~/server/database/schema'

export default defineEventHandler(async () => {
  let config = await db.query.captchaConfig.findFirst()
  
  if (!config) {
    const now = Date.now()
    const result = await db.insert(captchaConfig).values({
      enabled: true,
      provider: 'geetest',
      siteKey: '6ee08588ab316e0d6b6363fe997c6dc8',
      secretKey: '76ebe69604c10b14336b8b79d390b461',
      loginEnabled: true,
      registerEnabled: true,
      commentEnabled: true,
      updatedAt: now,
    }).returning()
    config = result[0]
  }

  return {
    success: true,
    data: {
      enabled: config?.enabled ?? true,
      provider: config?.provider ?? 'geetest',
      siteKey: config?.siteKey ?? '',
      loginEnabled: config?.loginEnabled ?? true,
      registerEnabled: config?.registerEnabled ?? true,
      commentEnabled: config?.commentEnabled ?? true,
    },
  }
})
