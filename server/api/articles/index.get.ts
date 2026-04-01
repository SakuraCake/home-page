import { defineEventHandler, getQuery } from '#imports'
import { eq, and, desc, like, sql, inArray, isNull } from 'drizzle-orm'
import { db } from '~/database'
import { articles, users, categories, tags, articleTags } from '~/database/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const { categoryId, tagId, status, keyword } = query

  const offset = (page - 1) * pageSize

  const conditions = [isNull(articles.deletedAt)]

  if (categoryId) {
    conditions.push(eq(articles.categoryId, Number(categoryId)))
  }

  if (status) {
    conditions.push(eq(articles.status, status as string))
  }

  if (keyword) {
    conditions.push(like(articles.title, `%${keyword}%`))
  }

  let articleIdsByTag: number[] | null = null
  if (tagId) {
    const tagRelations = await db
      .select({ articleId: articleTags.articleId })
      .from(articleTags)
      .where(eq(articleTags.tagId, Number(tagId)))
    
    articleIdsByTag = tagRelations.map(r => r.articleId)
    
    if (articleIdsByTag.length === 0) {
      return {
        success: true,
        data: {
          list: [],
          total: 0,
          page,
          pageSize,
        },
      }
    }
  }

  const whereClause = articleIdsByTag
    ? and(...conditions, inArray(articles.id, articleIdsByTag))
    : and(...conditions)

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(whereClause)

  const total = totalResult[0]?.count || 0

  const articleList = await db
    .select()
    .from(articles)
    .where(whereClause)
    .orderBy(desc(articles.createdAt))
    .limit(pageSize)
    .offset(offset)

  if (articleList.length === 0) {
    return {
      success: true,
      data: {
        list: [],
        total,
        page,
        pageSize,
      },
    }
  }

  const authorIds = [...new Set(articleList.map(a => a.authorId).filter(Boolean))]
  const categoryIds = [...new Set(articleList.map(a => a.categoryId).filter(Boolean))]
  const articleIdList = articleList.map(a => a.id)

  const authorMap = new Map<number, typeof users.$inferSelect>()
  if (authorIds.length > 0) {
    const authorList = await db
      .select()
      .from(users)
      .where(inArray(users.id, authorIds as number[]))
    authorList.forEach(author => authorMap.set(author.id, author))
  }

  const categoryMap = new Map<number, typeof categories.$inferSelect>()
  if (categoryIds.length > 0) {
    const categoryList = await db
      .select()
      .from(categories)
      .where(inArray(categories.id, categoryIds as number[]))
    categoryList.forEach(cat => categoryMap.set(cat.id, cat))
  }

  const tagRelations = await db
    .select()
    .from(articleTags)
    .where(inArray(articleTags.articleId, articleIdList))

  const tagIds = [...new Set(tagRelations.map(r => r.tagId))]
  const tagMap = new Map<number, typeof tags.$inferSelect>()
  if (tagIds.length > 0) {
    const tagList = await db
      .select()
      .from(tags)
      .where(inArray(tags.id, tagIds))
    tagList.forEach(tag => tagMap.set(tag.id, tag))
  }

  const articleTagsMap = new Map<number, typeof tags.$inferSelect[]>()
  tagRelations.forEach(relation => {
    const tag = tagMap.get(relation.tagId)
    if (tag) {
      const existing = articleTagsMap.get(relation.articleId) || []
      existing.push(tag)
      articleTagsMap.set(relation.articleId, existing)
    }
  })

  const list = articleList.map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    coverImage: article.coverImage,
    status: article.status,
    viewCount: article.viewCount,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author: article.authorId ? authorMap.get(article.authorId) || null : null,
    category: article.categoryId ? categoryMap.get(article.categoryId) || null : null,
    tags: articleTagsMap.get(article.id) || [],
  }))

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
