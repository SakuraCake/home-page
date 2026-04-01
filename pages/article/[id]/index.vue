<template>
  <v-container max-width="900">
    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-16">
            <v-icon size="80" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
            <h2 class="text-h5 mb-2">{{ error }}</h2>
            <v-btn color="primary" to="/article">
              返回列表
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <template v-else-if="article">
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-img
              v-if="article.coverImage"
              :src="article.coverImage"
              height="300"
              cover
            />
            <v-card-title class="text-h4 py-4 px-6">
              {{ article.title }}
            </v-card-title>
            <v-card-subtitle class="px-6">
              <v-chip size="small" label class="mr-2">
                <v-icon start>mdi-account</v-icon>
                {{ article.author?.username || '未知' }}
              </v-chip>
              <v-chip size="small" label class="mr-2">
                <v-icon start>mdi-calendar</v-icon>
                {{ formatDate(article.createdAt) }}
              </v-chip>
              <v-chip size="small" label class="mr-2">
                <v-icon start>mdi-eye</v-icon>
                {{ article.viewCount }} 次阅读
              </v-chip>
              <v-chip v-if="article.category" size="small" label color="primary">
                {{ article.category.name }}
              </v-chip>
            </v-card-subtitle>
            <v-divider class="my-4" />
            <v-card-text class="px-6 py-8">
              <div class="markdown-body" v-html="renderedContent" />
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-6">
              <v-btn variant="text" to="/article">
                <v-icon start>mdi-arrow-left</v-icon>
                返回列表
              </v-btn>
              <v-spacer />
              <template v-if="canEdit">
                <v-btn variant="text" :to="`/article/${article.id}/edit`">
                  <v-icon start>mdi-pencil</v-icon>
                  编辑
                </v-btn>
                <v-btn variant="text" color="error" @click="handleDelete">
                  <v-icon start>mdi-delete</v-icon>
                  删除
                </v-btn>
              </template>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" class="mt-4">
          <v-card>
            <v-card-title>评论</v-card-title>
            <v-card-text>
              <ArticleCommentSection :article-id="article.id" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()
const { renderMarkdown } = useMarkdown()

const id = computed(() => Number(route.params.id))
const article = computed(() => articleStore.currentArticle)
const loading = ref(true)
const error = ref('')

const canEdit = computed(() => {
  if (!userStore.isLoggedIn || !article.value) return false
  return userStore.isAdmin || userStore.user?.id === article.value.authorId
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  if (article.value.contentType === 'html') {
    return article.value.content
  }
  return renderMarkdown(article.value.content)
})

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleDelete = async () => {
  if (!confirm('确定要删除这篇文章吗？')) return
  
  const success = await articleStore.deleteArticle(id.value)
  if (success) {
    router.push('/article')
  }
}

const fetchArticle = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await articleStore.fetchArticle(id.value)
    if (!result) {
      error.value = articleStore.error || '文章不存在'
    }
  } catch (e: any) {
    error.value = e?.data?.message || '文章不存在'
  } finally {
    loading.value = false
  }
}

useHead({
  title: computed(() => article.value?.title || '文章详情')
})

onMounted(() => {
  fetchArticle()
})

onUnmounted(() => {
  articleStore.clearCurrentArticle()
})
</script>

<style>
.markdown-body {
  line-height: 1.8;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
.markdown-body p {
  margin-bottom: 1em;
}
.markdown-body pre {
  padding: 1em;
  overflow-x: auto;
  border-radius: 8px;
}
.markdown-body code {
  font-family: 'Fira Code', monospace;
}
.markdown-body img {
  max-width: 100%;
  border-radius: 8px;
}
</style>
