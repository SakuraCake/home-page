import { db } from '~/server/database'
import { siteConfig, captchaConfig } from '~/server/database/schema'

export default defineCachedEventHandler(async () => {
  let site = await db.query.siteConfig.findFirst()

  if (!site) {
    const now = Date.now()
    const result = await db.insert(siteConfig).values({
      siteName: 'SakuraCake',
      siteDescription: '一个简洁的博客系统',
      postsPerPage: 10,
      allowRegister: true,
      allowComment: true,
      commentNeedReview: false,
      updatedAt: now,
    }).returning()
    site = result[0]
  }

  let captcha = await db.query.captchaConfig.findFirst()

  if (!captcha) {
    const now = Date.now()
    const result = await db.insert(captchaConfig).values({
      enabled: true,
      provider: 'geetest',
      loginEnabled: true,
      registerEnabled: true,
      commentEnabled: true,
      updatedAt: now,
    }).returning()
    captcha = result[0]
  }

  return {
    success: true,
    data: {
      site: {
        siteName: site?.siteName ?? 'My Blog',
        siteDescription: site?.siteDescription ?? '',
        siteKeywords: site?.siteKeywords ?? '',
        siteUrl: site?.siteUrl ?? '',
        logo: site?.logo ?? '',
        favicon: site?.favicon ?? '',
        footerText: site?.footerText ?? '',
        icp: site?.icp ?? '',
        analyticsCode: site?.analyticsCode ?? '',
        postsPerPage: site?.postsPerPage ?? 10,
        allowRegister: site?.allowRegister ?? true,
        allowComment: site?.allowComment ?? true,
        commentNeedReview: site?.commentNeedReview ?? false,
      },
      captcha: {
        enabled: captcha?.enabled ?? true,
        provider: captcha?.provider ?? 'geetest',
        siteKey: captcha?.siteKey ?? '',
        loginEnabled: captcha?.loginEnabled ?? true,
        registerEnabled: captcha?.registerEnabled ?? true,
        commentEnabled: captcha?.commentEnabled ?? true,
      },
    },
  }
}, {
  maxAge: 60 * 60,
  swr: true,
  staleMaxAge: 60 * 60 * 2,
  getKey: () => 'config:site',
})
