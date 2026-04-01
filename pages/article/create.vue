<template>
  <v-container max-width="900">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 py-4 px-6">
            写文章
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
                hint="用于生成文章 URL，如: my-first-article"
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

              <v-alert v-if="error" type="error" class="mb-4">
                {{ error }}
              </v-alert>

              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                >
                  {{ form.status === 'published' ? '发布文章' : '保存草稿' }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  @click="handlePreview"
                >
                  预览
                </v-btn>
                <v-btn
                  variant="text"
                  to="/article"
                >
                  取消
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" v-if="showPreview">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>预览</span>
            <v-btn icon @click="showPreview = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="markdown-body" v-html="previewContent" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useArticleStore } from '~/stores/article'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()
const { renderMarkdown } = useMarkdown()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '文章', to: '/article' },
  { title: '写文章', disabled: true }
]

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

const loading = ref(false)
const error = ref('')
const showPreview = ref(false)

const categories = computed(() => articleStore.categories)
const tags = computed(() => articleStore.tags)

const statusOptions = [
  { title: '草稿', value: 'draft' },
  { title: '发布', value: 'published' }
]

const previewContent = computed(() => {
  return renderMarkdown(form.content)
})

const handlePreview = () => {
  showPreview.value = !showPreview.value
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const result = await articleStore.createArticle({
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
      content: form.content,
      summary: form.summary,
      coverImage: form.coverImage,
      categoryId: form.categoryId || undefined,
      tagIds: form.tagIds,
      status: form.status
    })

    if (result) {
      router.push(`/article/${result.id}`)
    } else {
      error.value = articleStore.error || '创建失败'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '创建失败'
  } finally {
    loading.value = false
  }
}

useHead({
  title: '写文章'
})

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  await Promise.all([
    articleStore.fetchCategories(),
    articleStore.fetchTags()
  ])
})
</script>
