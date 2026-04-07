import { defineEventHandler, getQuery } from 'h3'
import { eq, and, desc, isNull } from 'drizzle-orm'
import { db } from '~/server/database'
import { comments } from '~/server/database/schema'
import { requireAuth } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  if (session.role !== 'admin') {
    return {
      success: false,
      message: '权限不足',
    }
  }

  const query = getQuery(event)
  const status = query.status as string | undefined
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 20

  const whereConditions = [isNull(comments.deletedAt)]

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    whereConditions.push(eq(comments.status, status))
  }

  const allComments = await db.query.comments.findMany({
    where: and(...whereConditions),
    orderBy: [desc(comments.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      article: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  })

  const total = allComments.length
  const start = (page - 1) * pageSize
  const list = allComments.slice(start, start + pageSize)

  return {
    success: true,
    data: {
      list,
      total,
      page,
      pageSize,
    },
  }
})
