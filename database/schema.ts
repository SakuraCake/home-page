import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'
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
  visibility: text('visibility').default('public'),
  password: text('password'),
  publishAt: integer('publish_at'),
  viewCount: integer('view_count').default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
}, (table) => ({
  statusIdx: index('articles_status_idx').on(table.status),
  visibilityIdx: index('articles_visibility_idx').on(table.visibility),
  publishAtIdx: index('articles_publish_at_idx').on(table.publishAt),
  createdAtIdx: index('articles_created_at_idx').on(table.createdAt),
  authorIdx: index('articles_author_idx').on(table.authorId),
  categoryIdx: index('articles_category_idx').on(table.categoryId),
}))

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
  userId: integer('user_id').references(() => users.id),
  guestName: text('guest_name'),
  guestEmail: text('guest_email'),
  parentId: integer('parent_id').references((): any => comments.id),
  status: text('status').default('approved'),
  createdAt: integer('created_at').notNull(),
  deletedAt: integer('deleted_at'),
}, (table) => ({
  articleIdx: index('comments_article_idx').on(table.articleId),
  userIdx: index('comments_user_idx').on(table.userId),
  statusIdx: index('comments_status_idx').on(table.status),
  parentIdx: index('comments_parent_idx').on(table.parentId),
}))

export const captchaConfig = sqliteTable('captcha_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  provider: text('provider').default('geetest'),
  siteKey: text('site_key'),
  secretKey: text('secret_key'),
  loginEnabled: integer('login_enabled', { mode: 'boolean' }).default(true),
  registerEnabled: integer('register_enabled', { mode: 'boolean' }).default(true),
  commentEnabled: integer('comment_enabled', { mode: 'boolean' }).default(true),
  updatedAt: integer('updated_at').notNull(),
})

export const siteConfig = sqliteTable('site_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  siteName: text('site_name').default('My Blog'),
  siteDescription: text('site_description'),
  siteKeywords: text('site_keywords'),
  siteUrl: text('site_url'),
  logo: text('logo'),
  favicon: text('favicon'),
  footerText: text('footer_text'),
  icp: text('icp'),
  analyticsCode: text('analytics_code'),
  postsPerPage: integer('posts_per_page').default(10),
  allowRegister: integer('allow_register', { mode: 'boolean' }).default(true),
  allowComment: integer('allow_comment', { mode: 'boolean' }).default(true),
  commentNeedReview: integer('comment_need_review', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at').notNull(),
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
