import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(50, '用户名最多50个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string()
    .min(6, '密码至少6个字符')
    .max(100, '密码最多100个字符'),
  geetest_challenge: z.string().optional(),
  geetest_validate: z.string().optional(),
  geetest_seccode: z.string().optional(),
})

export const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(50, '用户名最多50个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string()
    .min(6, '密码至少6个字符')
    .max(100, '密码最多100个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  email: z.string()
    .email('邮箱格式不正确')
    .max(100, '邮箱最多100个字符')
    .optional()
    .or(z.literal('')),
  geetest_challenge: z.string().optional(),
  geetest_validate: z.string().optional(),
  geetest_seccode: z.string().optional(),
})

export const articleSchema = z.object({
  title: z.string()
    .min(1, '标题不能为空')
    .max(200, '标题最多200个字符'),
  slug: z.string()
    .min(1, 'slug不能为空')
    .max(200, 'slug最多200个字符')
    .regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符'),
  content: z.string().optional(),
  summary: z.string().max(500, '摘要最多500个字符').optional(),
  coverImage: z.string().url('封面图片URL格式不正确').optional().or(z.literal('')),
  categoryId: z.number().int().positive().optional().nullable(),
  tagIds: z.array(z.number().int().positive()).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
})

export const categorySchema = z.object({
  name: z.string()
    .min(1, '分类名称不能为空')
    .max(50, '分类名称最多50个字符'),
  slug: z.string()
    .min(1, 'slug不能为空')
    .max(50, 'slug最多50个字符')
    .regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符'),
  description: z.string().max(200, '描述最多200个字符').optional(),
})

export const tagSchema = z.object({
  name: z.string()
    .min(1, '标签名称不能为空')
    .max(50, '标签名称最多50个字符'),
  slug: z.string()
    .min(1, 'slug不能为空')
    .max(50, 'slug最多50个字符')
    .regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符'),
})

export const commentSchema = z.object({
  content: z.string()
    .min(1, '评论内容不能为空')
    .max(1000, '评论内容最多1000个字符'),
  articleId: z.number().int().positive('文章ID必须为正整数'),
  parentId: z.number().int().positive().optional().nullable(),
  guestName: z.string()
    .min(2, '昵称至少2个字符')
    .max(50, '昵称最多50个字符')
    .optional(),
  guestEmail: z.string()
    .email('邮箱格式不正确')
    .max(100, '邮箱最多100个字符')
    .optional(),
})

export const userUpdateSchema = z.object({
  email: z.string()
    .email('邮箱格式不正确')
    .max(100, '邮箱最多100个字符')
    .optional()
    .or(z.literal('')),
  avatar: z.string()
    .url('头像URL格式不正确')
    .optional()
    .or(z.literal('')),
})

export const passwordChangeSchema = z.object({
  oldPassword: z.string()
    .min(6, '密码至少6个字符'),
  newPassword: z.string()
    .min(6, '密码至少6个字符')
    .max(100, '密码最多100个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ArticleInput = z.infer<typeof articleSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type TagInput = z.infer<typeof tagSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
