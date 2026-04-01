import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').unique(),
  role: text('role').default('user'),
  avatar: text('avatar'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
})

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at').notNull(),
})

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  summary: text('summary'),
  coverImage: text('cover_image'),
  authorId: integer('author_id').references(() => users.id),
  categoryId: integer('category_id').references(() => categories.id),
  status: text('status').default('draft'),
  viewCount: integer('view_count').default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
})

export const articleTags = sqliteTable('article_tags', {
  articleId: integer('article_id').notNull().references(() => articles.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.articleId, table.tagId] }),
}))

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  articleId: integer('article_id').notNull().references(() => articles.id),
  userId: integer('user_id').notNull().references(() => users.id),
  parentId: integer('parent_id').references((): any => comments.id),
  createdAt: integer('created_at').notNull(),
  deletedAt: integer('deleted_at'),
})

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  comments: many(comments),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}))

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  articleTags: many(articleTags),
  comments: many(comments),
}))

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'comment_replies',
  }),
  replies: many(comments, {
    relationName: 'comment_replies',
  }),
}))
