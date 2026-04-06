import { defineEventHandler, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '~/database'
import { tags } from '~/database/schema'
import { requireAuth } from '~/server/utils/session'
import { defineAbilitiesFor, forbid } from '~/server/utils/abilities'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const ability = defineAbilitiesFor(session)

  if (!ability.can('create', 'Tag')) {
    forbid()
  }

  const body = await readBody(event)
  const { name, slug } = body

  if (!name || !slug) {
    return {
      success: false,
      message: '名称和 slug 不能为空',
    }
  }

  const existingName = await db.query.tags.findFirst({
    where: eq(tags.name, name),
  })

  if (existingName) {
    return {
      success: false,
      message: '标签名称已存在',
    }
  }

  const existingSlug = await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  })

  if (existingSlug) {
    return {
      success: false,
      message: '标签 slug 已存在',
    }
  }

  const now = Date.now()
  const result = await db
    .insert(tags)
    .values({
      name,
      slug,
      createdAt: now,
    })
    .returning()

  return {
    success: true,
    data: result[0],
  }
})
