<template>
  <v-container max-width="900">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">我的文章</h1>
          <v-btn color="primary" to="/article/create">
            <v-icon start>mdi-plus</v-icon>
            写文章
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" v-if="loading">
        <v-skeleton-loader type="card" />
      </v-col>

      <v-col cols="12" v-else-if="articles.length === 0">
        <v-card>
          <v-card-text class="text-center py-16">
            <v-icon size="80" color="primary" class="mb-4">mdi-file-document-outline</v-icon>
            <h2 class="text-h5 mb-2">暂无文章</h2>
            <v-btn color="primary" to="/article/create">
              开始创作
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <template v-else>
        <v-col cols="12" v-for="article in articles" :key="article.id">
          <v-card>
            <div class="d-flex">
              <v-img
                v-if="article.coverImage"
                :src="article.coverImage"
                width="200"
                height="150"
                cover
                class="flex-shrink-0"
              />
              <div class="flex-grow-1">
                <v-card-title class="text-h6">
                  {{ article.title }}
                  <v-chip
                    size="x-small"
                    :color="article.status === 'published' ? 'success' : 'warning'"
                    class="ml-2"
                  >
                    {{ article.status === 'published' ? '已发布' : '草稿' }}
                  </v-chip>
                </v-card-title>
                <v-card-subtitle>
                  {{ formatDate(article.createdAt) }} · {{ article.viewCount }} 次阅读
                </v-card-subtitle>
                <v-card-text>
                  {{ article.summary || '暂无摘要' }}
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    variant="text"
                    :to="`/article/${article.id}`"
                  >
                    查看
                  </v-btn>
                  <v-btn
                    variant="text"
                    :to="`/article/${article.id}/edit`"
                  >
                    编辑
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="error"
                    @click="handleDelete(article.id)"
                  >
                    删除
                  </v-btn>
                </v-card-actions>
              </div>
            </div>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const router = useRouter()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '用户中心', to: '/user' },
  { title: '我的文章', disabled: true }
]

const articles = ref<any[]>([])
const loading = ref(true)

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/user/articles', {
      headers: userStore.getAuthHeaders()
    })
    if (response.success) {
      articles.value = response.data
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这篇文章吗？')) return

  try {
    const response = await $fetch(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: userStore.getAuthHeaders()
    })

    if (response.success) {
      articles.value = articles.value.filter(a => a.id !== id)
    }
  } catch (e) {
    // ignore
  }
}

useHead({
  title: '我的文章'
})

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  fetchArticles()
})
</script>
