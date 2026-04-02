<template>
  <v-container max-width="900">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">我的评论</h1>
      </v-col>

      <v-col cols="12" v-if="loading">
        <v-skeleton-loader type="card" />
      </v-col>

      <v-col cols="12" v-else-if="comments.length === 0">
        <v-empty-state
          icon="mdi-comment-outline"
          title="暂无评论"
          text="还没有发表任何评论"
        />
      </v-col>

      <v-col cols="12" v-else>
        <v-card v-for="comment in comments" :key="comment.id" class="mb-4">
          <v-card-text>
            <div class="text-body-1 mb-2">{{ comment.content }}</div>
            <div class="d-flex justify-space-between align-center">
              <div class="text-caption text-medium-emphasis">
                评论于
                <NuxtLink :to="`/article/${comment.articleId}`" class="text-primary">
                  {{ comment.article?.title || '文章' }}
                </NuxtLink>
                · {{ formatDate(comment.createdAt) }}
              </div>
              <v-btn
                size="small"
                variant="text"
                color="error"
                @click="handleDelete(comment.id)"
              >
                删除
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const router = useRouter()
const snackbar = useSnackbar()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '用户中心', to: '/user' },
  { title: '我的评论', disabled: true }
]

const comments = ref<any[]>([])
const loading = ref(true)

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchComments = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/user/comments', {
      headers: userStore.getAuthHeaders()
    })
    if (response.success) {
      comments.value = response.data
    }
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这条评论吗？')) return

  try {
    const response = await $fetch(`/api/comments/${id}`, {
      method: 'DELETE',
      headers: userStore.getAuthHeaders()
    })

    if (response.success) {
      snackbar.success('评论已删除')
      comments.value = comments.value.filter(c => c.id !== id)
    }
  } catch (e) {
    snackbar.error('删除失败')
  }
}

useHead({
  title: '我的评论'
})

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  fetchComments()
})
</script>
