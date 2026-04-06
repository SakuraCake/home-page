<template>
  <v-container max-width="1200">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">
            文章管理
          </h1>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card>
          <ClientOnly>
            <v-data-table :headers="headers" :items="articles" :loading="loading">
              <template #item.status="{ item }">
                <v-chip size="small" :color="item.status === 'published' ? 'success' : 'warning'">
                  {{ item.status === 'published' ? '已发布' : '草稿' }}
                </v-chip>
              </template>
              <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template #item.actions="{ item }">
                <v-btn size="small" variant="text" :to="`/article/${item.id}`">
                  查看
                </v-btn>
                <v-btn size="small" variant="text" :to="`/article/${item.id}/edit`">
                  编辑
                </v-btn>
                <v-btn size="small" variant="text" color="error" @click="handleDelete(item.id)">
                  删除
                </v-btn>
              </template>
            </v-data-table>
          </ClientOnly>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { ArticleListItem, ApiResponse } from '~/types/api'

const userStore = useUserStore()
const router = useRouter()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '管理中心', to: '/admin' },
  { title: '文章管理', disabled: true }
]

const articles = ref<ArticleListItem[]>([])
const loading = ref(true)

const headers = [
  { title: 'ID', key: 'id' },
  { title: '标题', key: 'title' },
  { title: '作者', key: 'author.username' },
  { title: '状态', key: 'status' },
  { title: '浏览', key: 'viewCount' },
  { title: '创建时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false }
]

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const response = await $fetch<ApiResponse<ArticleListItem[]>>('/api/admin/articles', {
      headers: userStore.getAuthHeaders()
    })
    if (response.success && response.data) {
      articles.value = response.data
    }
  } catch (_e) {
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这篇文章吗？')) return

  try {
    const response = await $fetch<ApiResponse>(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: userStore.getAuthHeaders()
    })

    if (response.success) {
      articles.value = articles.value.filter(a => a.id !== id)
    }
  } catch (_e) {
  }
}

useHead({
  title: '文章管理'
})

onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/')
    return
  }
  fetchArticles()
})
</script>
