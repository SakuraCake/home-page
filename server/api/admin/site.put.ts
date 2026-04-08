import { defineEventHandler, readBody } from 'h3'
import { db } from '#server/database'
import { siteConfig } from '#server/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '#server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  
  if (session.role !== 'admin') {
    return {
      success: false,
      message: '权限不足',
    }
  }

  const body = await readBody(event)

  let config = await db.query.siteConfig.findFirst()
  const now = Date.now()

  if (config) {
    await db.update(siteConfig)
      .set({
        siteName: body.siteName ?? config.siteName,
        siteDescription: body.siteDescription ?? config.siteDescription,
        siteKeywords: body.siteKeywords ?? config.siteKeywords,
        siteUrl: body.siteUrl ?? config.siteUrl,
        logo: body.logo ?? config.logo,
        favicon: body.favicon ?? config.favicon,
        footerText: body.footerText ?? config.footerText,
        icp: body.icp ?? config.icp,
        analyticsCode: body.analyticsCode ?? config.analyticsCode,
        postsPerPage: body.postsPerPage ?? config.postsPerPage,
        allowRegister: body.allowRegister ?? config.allowRegister,
        allowComment: body.allowComment ?? config.allowComment,
        commentNeedReview: body.commentNeedReview ?? config.commentNeedReview,
        homeType: body.homeType ?? config.homeType,
        homeTitle: body.homeTitle ?? config.homeTitle,
        homeSubtitle: body.homeSubtitle ?? config.homeSubtitle,
        homeAvatar: body.homeAvatar ?? config.homeAvatar,
        homeCustomContent: body.homeCustomContent ?? config.homeCustomContent,
        homeDescription: body.homeDescription ?? config.homeDescription,
        homeShowArticles: body.homeShowArticles ?? config.homeShowArticles,
        socialLinks: body.socialLinks !== undefined ? JSON.stringify(body.socialLinks) : config.socialLinks,
        bangumiUsername: body.bangumiUsername ?? config.bangumiUsername,
        updatedAt: now,
      })
      .where(eq(siteConfig.id, config.id))
  } else {
    await db.insert(siteConfig).values({
      siteName: body.siteName ?? 'My Blog',
      siteDescription: body.siteDescription ?? '',
      siteKeywords: body.siteKeywords ?? '',
      siteUrl: body.siteUrl ?? '',
      logo: body.logo ?? '',
      favicon: body.favicon ?? '',
      footerText: body.footerText ?? '',
      icp: body.icp ?? '',
      analyticsCode: body.analyticsCode ?? '',
      postsPerPage: body.postsPerPage ?? 10,
      allowRegister: body.allowRegister ?? true,
      allowComment: body.allowComment ?? true,
      commentNeedReview: body.commentNeedReview ?? false,
      homeType: body.homeType ?? 'welcome',
      homeTitle: body.homeTitle ?? '',
      homeSubtitle: body.homeSubtitle ?? '',
      homeAvatar: body.homeAvatar ?? '',
      homeCustomContent: body.homeCustomContent ?? '',
      homeDescription: body.homeDescription ?? '',
      homeShowArticles: body.homeShowArticles ?? true,
      socialLinks: body.socialLinks ? JSON.stringify(body.socialLinks) : null,
      bangumiUsername: body.bangumiUsername ?? '',
      updatedAt: now,
    })
  }

  config = await db.query.siteConfig.findFirst()

  return {
    success: true,
    data: config,
  }
})
