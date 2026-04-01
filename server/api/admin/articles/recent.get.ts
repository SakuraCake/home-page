import { defineEventHandler } from '#imports'
import { db } from '~/database'
import { articles } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  if (session.role !== 'admin') {
    return {
      success: false,
      message: '需要管理员权限'
    }
  }

  const recentArticles = await db.query.articles.findMany({
    orderBy: [desc(articles.createdAt)],
    limit: 5,
    columns: {
      id: true,
      title: true,
      createdAt: true
    },
    with: {
      author: {
        columns: {
          id: true,
          username: true
        }
      }
    }
  })

  return {
    success: true,
    data: recentArticles
  }
})
