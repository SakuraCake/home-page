<template>
  <v-container max-width="900">
    <v-row v-if="loading">
      <v-col cols="12">
        <v-card>
          <v-skeleton-loader
            type="image"
            height="300"
          />
          <v-card-title class="py-4 px-6">
            <v-skeleton-loader
              type="text"
              width="60%"
              height="36"
            />
          </v-card-title>
          <v-card-subtitle class="px-6">
            <v-skeleton-loader
              type="text"
              width="80%"
            />
          </v-card-subtitle>
          <v-divider class="my-4" />
          <v-card-text class="px-6 py-8">
            <v-skeleton-loader type="paragraph@8" />
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-6">
            <v-skeleton-loader type="button" />
            <v-spacer />
            <v-skeleton-loader type="button@2" />
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        class="mt-4"
      >
        <v-card>
          <v-card-title>
            <v-skeleton-loader
              type="text"
              width="80"
            />
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader type="paragraph@3" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12">
        <v-empty-state
          icon="mdi-alert-circle-outline"
          :text="error"
          title="加载失败"
        >
          <template #actions>
            <v-btn
              color="primary"
              to="/article"
            >
              返回列表
            </v-btn>
          </template>
        </v-empty-state>
      </v-col>
    </v-row>

    <template v-else-if="article">
      <v-row v-if="article.needsPassword">
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-h4 py-4 px-6">
              {{ article.title }}
            </v-card-title>
            <v-card-subtitle class="px-6">
              <v-chip
                size="small"
                label
                color="warning"
              >
                <v-icon start>
                  mdi-lock
                </v-icon>
                密码保护
              </v-chip>
            </v-card-subtitle>
            <v-divider class="my-4" />
            <v-card-text class="px-6 py-8">
              <v-alert
                type="info"
                class="mb-4"
              >
                这篇文章需要密码才能查看
              </v-alert>
              <v-form @submit.prevent="verifyPassword">
                <v-text-field
                  v-model="passwordInput"
                  label="请输入访问密码"
                  type="password"
                  variant="outlined"
                  :error-messages="passwordError"
                  :loading="verifying"
                />
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="verifying"
                >
                  验证密码
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else>
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
              <v-chip
                size="small"
                label
                class="mr-2"
              >
                <v-icon start>
                  mdi-account
                </v-icon>
                {{ article.author?.username || '未知' }}
              </v-chip>
              <v-chip
                size="small"
                label
                class="mr-2"
              >
                <v-icon start>
                  mdi-calendar
                </v-icon>
                {{ formatDate(article.createdAt) }}
              </v-chip>
              <v-chip
                size="small"
                label
                class="mr-2"
              >
                <v-icon start>
                  mdi-eye
                </v-icon>
                {{ article.viewCount }} 次阅读
              </v-chip>
              <v-chip
                v-if="article.category"
                size="small"
                label
                color="primary"
              >
                {{ article.category.name }}
              </v-chip>
            </v-card-subtitle>
            <v-divider class="my-4" />
            <v-card-text class="px-6 py-8">
              <div
                class="markdown-body"
                v-html="renderedContent"
              />
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-6">
              <v-btn
                variant="text"
                to="/article"
              >
                <v-icon start>
                  mdi-arrow-left
                </v-icon>
                返回列表
              </v-btn>
              <v-spacer />
              <template v-if="canEdit">
                <v-btn
                  variant="text"
                  :to="`/article/${article.id}/edit`"
                >
                  <v-icon start>
                    mdi-pencil
                  </v-icon>
                  编辑
                </v-btn>
                <v-btn
                  variant="text"
                  color="error"
                  @click="handleDelete"
                >
                  <v-icon start>
                    mdi-delete
                  </v-icon>
                  删除
                </v-btn>
              </template>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          class="mt-4"
        >
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
import type { ArticleDetail, ApiResponse } from '#shared/types/api'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()
const { renderMarkdown } = useMarkdown()

const id = computed(() => Number(route.params.id))

const { data: articleResponse, pending, error: fetchError } = await useFetch<ApiResponse<ArticleDetail>>(
  computed(() => `/api/articles/${id.value}`),
  {
    key: computed(() => `article-${id.value}`),
    server: true,
    lazy: false,
  }
)

const article = computed(() => {
  return articleResponse.value?.data || articleStore.currentArticle
})

watch(articleResponse, (newVal) => {
  if (newVal?.data) {
    articleStore.currentArticle = newVal.data
  }
}, { immediate: true })
const loading = computed(() => pending.value)
const error = computed(() => {
  if (fetchError.value) {
    return fetchError.value.message || '文章不存在'
  }
  if (!articleResponse.value && !pending.value) {
    return '文章不存在'
  }
  return ''
})

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

const passwordInput = ref('')
const passwordError = ref('')
const verifying = ref(false)

const verifyPassword = async () => {
  if (!passwordInput.value) {
    passwordError.value = '请输入密码'
    return
  }

  verifying.value = true
  passwordError.value = ''

  try {
    const response = await $fetch(`/api/articles/${id.value}/verify`, {
      method: 'POST',
      body: { password: passwordInput.value }
    })

    if (response.success) {
      window.location.reload()
    }
  } catch (e: any) {
    passwordError.value = e?.data?.message || '密码错误'
  } finally {
    verifying.value = false
  }
}

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

useHead({
  title: computed(() => article.value?.title || '文章详情'),
  meta: [
    {
      name: 'description',
      content: computed(() => article.value?.summary || ''),
    },
    {
      property: 'og:title',
      content: computed(() => article.value?.title || ''),
    },
    {
      property: 'og:description',
      content: computed(() => article.value?.summary || ''),
    },
    {
      property: 'og:image',
      content: computed(() => article.value?.coverImage || ''),
    },
  ],
})

onUnmounted(() => {
  articleStore.clearCurrentArticle()
})
</script>

<style>
.markdown-body {
  line-height: 1.8;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
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
