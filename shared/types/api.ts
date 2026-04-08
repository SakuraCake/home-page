export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

export interface PaginatedResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface User {
  id: number
  username: string
  email: string | null
  role: string | null
  avatar: string | null
  bio: string | null
  website: string | null
  github: string | null
  twitter: string | null
  weibo: string | null
  createdAt: number
  updatedAt: number
}

export interface ArticleBase {
  id: number
  title: string
  slug: string
  summary: string | null
  coverImage: string | null
  status: string | null
  visibility?: string | null
  hasPassword?: boolean
  viewCount: number | null
  createdAt: number
  updatedAt: number
  publishAt?: number | null
  author?: {
    id: number
    username: string
    email?: string | null
    avatar: string | null
  } | null
  category?: {
    id: number
    name: string
    slug: string
  } | null
  tags?: Array<{
    id: number
    name: string
    slug: string
  }>
}

export interface ArticleListItem extends ArticleBase { }

export interface Article extends ArticleBase {
  content: string | null
  authorId: number | null
  categoryId: number | null
  needsPassword?: boolean
}

export interface ArticleDetail extends Article {
  contentType?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: number
  updatedAt: number
}

export interface CategoryWithCount extends Category {
  articleCount: number
}

export interface Tag {
  id: number
  name: string
  slug: string
  createdAt: number
}

export interface TagWithCount extends Tag {
  articleCount: number
}

export interface Comment {
  id: number
  content: string
  articleId: number
  userId: number | null
  parentId: number | null
  status: string
  guestName: string | null
  guestEmail: string | null
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  user?: {
    id: number
    username: string
    avatar: string | null
  } | null
}

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[]
}

export interface CommentWithArticle extends Comment {
  article: {
    id: number
    title: string
  } | null
}

export interface SocialLink {
  name: string
  url: string
  icon: string
}

export interface SiteConfig {
  siteName: string | null
  siteDescription: string | null
  siteKeywords: string | null
  siteUrl: string | null
  logo: string | null
  favicon: string | null
  footerText: string | null
  icp: string | null
  analyticsCode: string | null
  postsPerPage: number | null
  allowRegister: boolean | null
  allowComment: boolean | null
  commentNeedReview: boolean | null
  homeType: string | null
  homeTitle: string | null
  homeSubtitle: string | null
  homeAvatar: string | null
  homeCustomContent: string | null
  homeDescription: string | null
  homeShowArticles: boolean | null
  socialLinks: SocialLink[] | null
  bangumiUsername: string | null
}

export interface CaptchaConfig {
  enabled: boolean
  provider: string
  siteKey: string
  loginEnabled: boolean
  registerEnabled: boolean
  commentEnabled: boolean
}
