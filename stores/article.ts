import { defineStore } from 'pinia'
import type { ArticleListItem, ArticleDetail, CategoryWithCount, TagWithCount, ApiResponse, PaginatedResponse } from '~/types/api'

interface ArticleState {
  articles: ArticleListItem[]
  currentArticle: ArticleDetail | null
  categories: CategoryWithCount[]
  tags: TagWithCount[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

export const useArticleStore = defineStore('article', {
  state: (): ArticleState => ({
    articles: [],
    currentArticle: null,
    categories: [],
    tags: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 10,
  }),

  getters: {
    hasMore: (state) => state.page * state.pageSize < state.total,
  },

  actions: {
    async fetchArticles(params?: {
      page?: number
      pageSize?: number
      categoryId?: number
      tagId?: number
      status?: string
      keyword?: string
    }) {
      this.loading = true
      this.error = null

      try {
        const { postsPerPage } = useSiteConfig()

        const query: Record<string, any> = {
          page: params?.page || this.page,
          pageSize: params?.pageSize || postsPerPage.value || this.pageSize,
        }

        if (params?.categoryId) query.categoryId = params.categoryId
        if (params?.tagId) query.tagId = params.tagId
        if (params?.status) query.status = params.status
        if (params?.keyword) query.keyword = params.keyword

        const response = await $fetch<ApiResponse<PaginatedResponse<ArticleListItem>>>('/api/articles', { query })

        if (response.success && response.data) {
          this.articles = response.data.list
          this.total = response.data.total
          this.page = response.data.page
          this.pageSize = response.data.pageSize
        }
      } catch (e) {
        this.error = e instanceof Error ? e.message : '获取文章列表失败'
      } finally {
        this.loading = false
      }
    },

    async fetchArticle(id: number) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<ApiResponse<ArticleDetail>>(`/api/articles/${id}`)

        if (response.success && response.data) {
          this.currentArticle = response.data
          return response.data
        }

        return null
      } catch (e) {
        this.error = e instanceof Error ? e.message : '获取文章详情失败'
        return null
      } finally {
        this.loading = false
      }
    },

    async createArticle(data: {
      title: string
      slug: string
      content: string
      summary?: string
      coverImage?: string
      categoryId?: number
      tagIds?: number[]
      status?: string
      visibility?: string
      password?: string
      publishAt?: number
    }) {
      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()
        const response = await $fetch<ApiResponse<ArticleDetail>>('/api/articles', {
          method: 'POST',
          body: data,
          headers: userStore.getAuthHeaders(),
        })

        if (response.success && response.data) {
          return response.data
        }
        this.error = response.message || '创建文章失败'
        return null
      } catch (e) {
        this.error = e instanceof Error ? e.message : '创建文章失败'
        return null
      } finally {
        this.loading = false
      }
    },

    async updateArticle(id: number, data: Partial<{
      title: string
      slug: string
      content: string
      summary: string
      coverImage: string
      categoryId: number
      tagIds: number[]
      status: string
      visibility: string
      password: string
      publishAt: number
    }>) {
      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()
        const response = await $fetch<ApiResponse<ArticleDetail>>(`/api/articles/${id}`, {
          method: 'PUT',
          body: data,
          headers: userStore.getAuthHeaders(),
        })

        if (response.success && response.data) {
          return response.data
        }
        this.error = response.message || '更新文章失败'
        return null
      } catch (e) {
        this.error = e instanceof Error ? e.message : '更新文章失败'
        return null
      } finally {
        this.loading = false
      }
    },

    async deleteArticle(id: number) {
      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()
        const response = await $fetch<ApiResponse>(`/api/articles/${id}`, {
          method: 'DELETE',
          headers: userStore.getAuthHeaders(),
        })

        if (response.success) {
          return true
        }
        this.error = response.message || '删除文章失败'
        return false
      } catch (e) {
        this.error = e instanceof Error ? e.message : '删除文章失败'
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const response = await $fetch<ApiResponse<CategoryWithCount[]>>('/api/categories')

        if (response.success && response.data) {
          this.categories = response.data
        }
      } catch (_e) {
      }
    },

    async fetchTags() {
      try {
        const response = await $fetch<ApiResponse<TagWithCount[]>>('/api/tags')

        if (response.success && response.data) {
          this.tags = response.data
        }
      } catch (_e) {
      }
    },

    clearCurrentArticle() {
      this.currentArticle = null
    },
  },
})
