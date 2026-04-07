import { defineEventHandler } from 'h3'
import { db } from '~/server/database'
import { users, articles, categories, tags } from '~/server/database/schema'
import { requireAuth } from '~/server/utils/session'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  if (session.role !== 'admin') {
    return {
      success: false,
      message: '需要管理员权限'
    }
  }

  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users)
  const [articleCount] = await db.select({ count: sql<number>`count(*)` }).from(articles)
  const [categoryCount] = await db.select({ count: sql<number>`count(*)` }).from(categories)
  const [tagCount] = await db.select({ count: sql<number>`count(*)` }).from(tags)

  return {
    success: true,
    data: {
      userCount: userCount?.count || 0,
      articleCount: articleCount?.count || 0,
      categoryCount: categoryCount?.count || 0,
      tagCount: tagCount?.count || 0
    }
  }
})
