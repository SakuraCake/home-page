import { defineEventHandler, readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { categories } from '~/server/database/schema'
import { requireAuth } from '~/server/utils/session'
import { defineAbilitiesFor, forbid } from '~/server/utils/abilities'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const ability = defineAbilitiesFor(session)

  if (!ability.can('create', 'Category')) {
    forbid()
  }

  const body = await readBody(event)
  const { name, slug, description } = body

  if (!name || !slug) {
    return {
      success: false,
      message: '名称和 slug 不能为空',
    }
  }

  const existingName = await db.query.categories.findFirst({
    where: eq(categories.name, name),
  })

  if (existingName) {
    return {
      success: false,
      message: '分类名称已存在',
    }
  }

  const existingSlug = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  })

  if (existingSlug) {
    return {
      success: false,
      message: '分类 slug 已存在',
    }
  }

  const now = Date.now()
  const result = await db
    .insert(categories)
    .values({
      name,
      slug,
      description: description || null,
      createdAt: now,
    })
    .returning()

  return {
    success: true,
    data: result[0],
  }
})
