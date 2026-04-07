import { defineEventHandler } from 'h3'
import { db } from '~/server/database'
import { siteConfig } from '~/server/database/schema'
import type { SocialLink } from '~/types/api'

export default defineEventHandler(async () => {
  let config = await db.query.siteConfig.findFirst()
  
  if (!config) {
    const now = Date.now()
    const result = await db.insert(siteConfig).values({
      siteName: 'My Blog',
      siteDescription: '',
      postsPerPage: 10,
      allowRegister: true,
      allowComment: true,
      commentNeedReview: false,
      homeShowArticles: true,
      socialLinks: '[]',
      bangumiUsername: '',
      updatedAt: now,
    }).returning()
    config = result[0]
  }

  let socialLinks: SocialLink[] | null = null
  if (config?.socialLinks) {
    try {
      socialLinks = JSON.parse(config.socialLinks)
    } catch {
      socialLinks = null
    }
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
      homeTitle: config?.homeTitle ?? '',
      homeSubtitle: config?.homeSubtitle ?? '',
      homeAvatar: config?.homeAvatar ?? '',
      homeDescription: config?.homeDescription ?? '',
      homeShowArticles: config?.homeShowArticles ?? true,
      socialLinks,
      bangumiUsername: config?.bangumiUsername ?? '',
    }
  }
})
