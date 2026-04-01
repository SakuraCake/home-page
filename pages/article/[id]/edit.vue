<template>
  <v-container max-width="900">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>

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

    <v-row v-else-if="article">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 py-4 px-6">
            编辑文章
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="form.title"
                label="标题"
                variant="outlined"
                class="mb-4"
                @keydown.enter.prevent
              />

              <v-text-field
                v-model="form.slug"
                label="Slug (URL 友好标识)"
                variant="outlined"
                class="mb-4"
                @keydown.enter.prevent
              />

              <v-text-field
                v-model="form.summary"
                label="摘要"
                variant="outlined"
                class="mb-4"
                @keydown.enter.prevent
              />

              <v-text-field
                v-model="form.coverImage"
                label="封面图片 URL"
                variant="outlined"
                class="mb-4"
                @keydown.enter.prevent
              />

              <v-select
                v-model="form.categoryId"
                :items="categories"
                item-title="name"
                item-value="id"
                label="分类"
                variant="outlined"
                clearable
                class="mb-4"
              />

              <v-select
                v-model="form.tagIds"
                :items="tags"
                item-title="name"
                item-value="id"
                label="标签"
                variant="outlined"
                multiple
                chips
                clearable
                class="mb-4"
              />

              <v-select
                v-model="form.status"
                :items="statusOptions"
                label="状态"
                variant="outlined"
                class="mb-4"
              />

              <v-textarea
                v-model="form.content"
                label="内容 (Markdown)"
                variant="outlined"
                rows="20"
                auto-grow
                class="mb-4"
              />

              <v-alert v-if="errorMessage" type="error" class="mb-4">
                {{ errorMessage }}
              </v-alert>

              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="submitting"
                >
                  保存更改
                </v-btn>
                <v-btn
                  variant="text"
                  :to="`/article/${id}`"
                >
                  取消
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useArticleStore } from '~/stores/article'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()

const id = computed(() => Number(route.params.id))
const article = computed(() => articleStore.currentArticle)
const loading = ref(true)
const error = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const breadcrumbs = computed(() => [
  { title: '首页', to: '/' },
  { title: '文章', to: '/article' },
  { title: article.value?.title || '编辑文章', disabled: true }
])

const form = reactive({
  title: '',
  slug: '',
  summary: '',
  coverImage: '',
  categoryId: null as number | null,
  tagIds: [] as number[],
  status: 'draft',
  content: ''
})

const categories = computed(() => articleStore.categories)
const tags = computed(() => articleStore.tags)

const statusOptions = [
  { title: '草稿', value: 'draft' },
  { title: '发布', value: 'published' }
]

const handleSubmit = async () => {
  errorMessage.value = ''
  submitting.value = true

  try {
    const result = await articleStore.updateArticle(id.value, {
      title: form.title,
      slug: form.slug,
      content: form.content,
      summary: form.summary,
      coverImage: form.coverImage,
      categoryId: form.categoryId || undefined,
      tagIds: form.tagIds,
      status: form.status
    })

    if (result) {
      router.push(`/article/${id.value}`)
    } else {
      errorMessage.value = articleStore.error || '保存失败'
    }
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : '保存失败'
  } finally {
    submitting.value = false
  }
}

useHead({
  title: computed(() => article.value ? `编辑: ${article.value.title}` : '编辑文章')
})

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  try {
    await Promise.all([
      articleStore.fetchArticle(id.value),
      articleStore.fetchCategories(),
      articleStore.fetchTags()
    ])

    if (article.value) {
      if (!userStore.isAdmin && userStore.user?.id !== article.value.authorId) {
        error.value = '您没有权限编辑这篇文章'
        return
      }

      form.title = article.value.title || ''
      form.slug = article.value.slug || ''
      form.summary = article.value.summary || ''
      form.coverImage = article.value.coverImage || ''
      form.categoryId = article.value.categoryId
      form.tagIds = article.value.tags?.map((t: any) => t.id) || []
      form.status = article.value.status || 'draft'
      form.content = article.value.content || ''
    } else {
      error.value = '文章不存在'
    }
  } catch (e) {
    error.value = '加载文章失败'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  articleStore.clearCurrentArticle()
})
</script>
