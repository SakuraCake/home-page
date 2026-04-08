import { defineEventHandler, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '#server/database'
import { users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  const { email, avatar, bio, website, github, twitter, weibo } = body

  const updateData: Record<string, any> = {
    updatedAt: Date.now()
  }

  if (email !== undefined) {
    updateData.email = email || null
  }

  if (avatar !== undefined) {
    updateData.avatar = avatar || null
  }

  if (bio !== undefined) {
    updateData.bio = bio || null
  }

  if (website !== undefined) {
    updateData.website = website || null
  }

  if (github !== undefined) {
    updateData.github = github || null
  }

  if (twitter !== undefined) {
    updateData.twitter = twitter || null
  }

  if (weibo !== undefined) {
    updateData.weibo = weibo || null
  }

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, session.userId))
    .returning()

  const updatedUser = result[0]

  if (!updatedUser) {
    return {
      success: false,
      message: '更新失败',
    }
  }

  return {
    success: true,
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      website: updatedUser.website,
      github: updatedUser.github,
      twitter: updatedUser.twitter,
      weibo: updatedUser.weibo,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    }
  }
})
