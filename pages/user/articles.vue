<template>
  <v-container max-width="900">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs
          :items="breadcrumbs"
          class="pa-0 mb-4"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">
            我的文章
          </h1>
          <v-btn
            color="primary"
            to="/article/create"
          >
            <v-icon start>
              mdi-plus
            </v-icon>
            写文章
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-tabs
          v-model="currentTab"
          color="primary"
        >
          <v-tab value="published">
            已发布
            <v-badge
              v-if="publishedArticles.length > 0"
              :content="publishedArticles.length"
              inline
            />
          </v-tab>
          <v-tab value="draft">
            草稿
            <v-badge
              v-if="draftArticles.length > 0"
              :content="draftArticles.length"
              color="warning"
              inline
            />
          </v-tab>
        </v-tabs>
      </v-col>

      <template v-if="loading">
        <v-col
          v-for="i in 3"
          :key="i"
          cols="12"
        >
          <v-card>
            <div class="d-flex">
              <v-skeleton-loader
                type="image"
                width="200"
                height="150"
                class="flex-shrink-0"
              />
              <div class="flex-grow-1">
                <v-card-title>
                  <v-skeleton-loader
                    type="text"
                    width="60%"
                  />
                </v-card-title>
                <v-card-subtitle>
                  <v-skeleton-loader
                    type="text"
                    width="40%"
                  />
                </v-card-subtitle>
                <v-card-text>
                  <v-skeleton-loader type="text@2" />
                </v-card-text>
                <v-card-actions>
                  <v-skeleton-loader type="button@3" />
                </v-card-actions>
              </div>
            </div>
          </v-card>
        </v-col>
      </template>

      <v-col
        v-else-if="filteredArticles.length === 0"
        cols="12"
      >
        <v-empty-state
          :icon="currentTab === 'published' ? 'mdi-file-document-outline' : 'mdi-file-edit-outline'"
          :title="currentTab === 'published' ? '暂无已发布文章' : '暂无草稿'"
          :text="currentTab === 'published' ? '还没有发布任何文章' : '还没有保存任何草稿'"
        >
          <template #actions>
            <v-btn
              color="primary"
              to="/article/create"
            >
              开始创作
            </v-btn>
          </template>
        </v-empty-state>
      </v-col>

      <template v-else>
        <v-col
          v-for="article in filteredArticles"
          :key="article.id"
          cols="12"
        >
          <v-card>
            <div class="d-flex flex-column flex-sm-row">
              <v-img
                v-if="article.coverImage"
                :src="article.coverImage"
                width="100%"
                min-width="200"
                max-width="200"
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
const snackbar = useSnackbar()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '用户中心', to: '/user' },
  { title: '我的文章', disabled: true }
]

const articles = ref<any[]>([])
const loading = ref(true)
const currentTab = ref('published')

const publishedArticles = computed(() => 
  articles.value.filter(a => a.status === 'published')
)

const draftArticles = computed(() => 
  articles.value.filter(a => a.status === 'draft')
)

const filteredArticles = computed(() => 
  currentTab.value === 'published' ? publishedArticles.value : draftArticles.value
)

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
  } catch (_e) {
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
      snackbar.success('文章已删除')
      articles.value = articles.value.filter(a => a.id !== id)
    }
  } catch (_e) {
    snackbar.error('删除失败')
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
