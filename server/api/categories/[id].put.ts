import { defineEventHandler, readBody, getRouterParam } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '#server/database'
import { categories } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { defineAbilitiesFor, forbid } from '#server/utils/abilities'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const ability = defineAbilitiesFor(session)

  if (!ability.can('update', 'Category')) {
    forbid()
  }

  const id = parseInt(getRouterParam(event, 'id') || '0')

  if (!id) {
    return {
      success: false,
      message: '无效的分类 ID',
    }
  }

  const existingCategory = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  })

  if (!existingCategory) {
    return {
      success: false,
      message: '分类不存在',
    }
  }

  const body = await readBody(event)
  const { name, slug, description } = body

  if (name && name !== existingCategory.name) {
    const existingName = await db.query.categories.findFirst({
      where: eq(categories.name, name),
    })

    if (existingName) {
      return {
        success: false,
        message: '分类名称已存在',
      }
    }
  }

  if (slug && slug !== existingCategory.slug) {
    const existingSlug = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    })

    if (existingSlug) {
      return {
        success: false,
        message: '分类 slug 已存在',
      }
    }
  }

  const result = await db
    .update(categories)
    .set({
      name: name || existingCategory.name,
      slug: slug || existingCategory.slug,
      description: description !== undefined ? description : existingCategory.description,
    })
    .where(eq(categories.id, id))
    .returning()

  return {
    success: true,
    data: result[0],
  }
})
