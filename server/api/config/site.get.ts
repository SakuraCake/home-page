import { defineEventHandler } from 'h3'
import { db } from '~/database'
import { siteConfig } from '~/database/schema'

export default defineEventHandler(async () => {
  let config = await db.query.siteConfig.findFirst()
  
  if (!config) {
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
    config = result[0]
  }

  return {
    success: true,
    data: {
      siteName: config?.siteName ?? 'My Blog',
      siteDescription: config?.siteDescription ?? '',
      siteKeywords: config?.siteKeywords ?? '',
      siteUrl: config?.siteUrl ?? '',
      logo: config?.logo ?? '',
      favicon: config?.favicon ?? '',
      footerText: config?.footerText ?? '',
      icp: config?.icp ?? '',
      analyticsCode: config?.analyticsCode ?? '',
      postsPerPage: config?.postsPerPage ?? 10,
      allowRegister: config?.allowRegister ?? true,
      allowComment: config?.allowComment ?? true,
      commentNeedReview: config?.commentNeedReview ?? false,
    },
  }
})
