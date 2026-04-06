<template>
  <v-container max-width="1200">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">
          管理中心
        </h1>
      </v-col>

      <v-col cols="12" md="3">
        <v-card to="/admin/users">
          <v-card-text class="text-center py-6">
            <v-icon size="48" color="primary" class="mb-2">
              mdi-account-group
            </v-icon>
            <div class="text-h4">
              {{ stats.userCount }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              用户总数
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card to="/admin/articles">
          <v-card-text class="text-center py-6">
            <v-icon size="48" color="success" class="mb-2">
              mdi-file-document-multiple
            </v-icon>
            <div class="text-h4">
              {{ stats.articleCount }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              文章总数
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card to="/admin/categories">
          <v-card-text class="text-center py-6">
            <v-icon size="48" color="warning" class="mb-2">
              mdi-folder-multiple
            </v-icon>
            <div class="text-h4">
              {{ stats.categoryCount }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              分类总数
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card to="/admin/tags">
          <v-card-text class="text-center py-6">
            <v-icon size="48" color="info" class="mb-2">
              mdi-tag-multiple
            </v-icon>
            <div class="text-h4">
              {{ stats.tagCount }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              标签总数
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>快捷操作</v-card-title>
          <v-divider />
          <v-list>
            <v-list-item to="/admin/categories">
              <template #prepend>
                <v-icon>mdi-folder-plus</v-icon>
              </template>
              <v-list-item-title>管理分类</v-list-item-title>
            </v-list-item>
            <v-list-item to="/admin/tags">
              <template #prepend>
                <v-icon>mdi-tag-plus</v-icon>
              </template>
              <v-list-item-title>管理标签</v-list-item-title>
            </v-list-item>
            <v-list-item to="/admin/articles">
              <template #prepend>
                <v-icon>mdi-file-document-edit</v-icon>
              </template>
              <v-list-item-title>管理文章</v-list-item-title>
            </v-list-item>
            <v-list-item to="/admin/users">
              <template #prepend>
                <v-icon>mdi-account-cog</v-icon>
              </template>
              <v-list-item-title>管理用户</v-list-item-title>
            </v-list-item>
            <v-list-item to="/admin/captcha">
              <template #prepend>
                <v-icon>mdi-shield-check</v-icon>
              </template>
              <v-list-item-title>验证码配置</v-list-item-title>
            </v-list-item>
            <v-list-item to="/admin/settings">
              <template #prepend>
                <v-icon>mdi-cog-outline</v-icon>
              </template>
              <v-list-item-title>系统设置</v-list-item-title>
            </v-list-item>
            <v-list-item to="/admin/comments">
              <template #prepend>
                <v-icon>mdi-comment-multiple</v-icon>
              </template>
              <v-list-item-title>评论管理</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>最新文章</v-card-title>
          <v-divider />
          <v-list v-if="recentArticles.length">
            <v-list-item v-for="article in recentArticles" :key="article.id" :to="`/article/${article.id}`">
              <v-list-item-title>{{ article.title }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ article.author?.username }} · {{ formatDate(article.createdAt) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-empty-state v-else icon="mdi-file-document-outline" title="暂无文章" text="还没有任何文章" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { ArticleListItem, ApiResponse } from '~/types/api'

interface Stats {
  userCount: number
  articleCount: number
  categoryCount: number
  tagCount: number
}

const userStore = useUserStore()
const router = useRouter()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '管理中心', disabled: true }
]

const stats = ref<Stats>({
  userCount: 0,
  articleCount: 0,
  categoryCount: 0,
  tagCount: 0
})

const recentArticles = ref<ArticleListItem[]>([])

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const fetchStats = async () => {
  try {
    const response = await $fetch<ApiResponse<Stats>>('/api/admin/stats', {
      headers: userStore.getAuthHeaders()
    })
    if (response.success && response.data) {
      stats.value = response.data
    }
  } catch (_e) {
  }
}

const fetchRecentArticles = async () => {
  try {
    const response = await $fetch<ApiResponse<ArticleListItem[]>>('/api/admin/articles/recent', {
      headers: userStore.getAuthHeaders()
    })
    if (response.success && response.data) {
      recentArticles.value = response.data
    }
  } catch (_e) {
  }
}

useHead({
  title: '管理中心'
})

onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/')
    return
  }
  fetchStats()
  fetchRecentArticles()
})
</script>
