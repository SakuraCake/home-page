<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card height="100%">
          <v-card-title class="text-h4 py-4 px-6">
            写文章
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleSubmit">
              <v-text-field v-model="form.title" label="标题" variant="outlined" class="mb-4" @keydown.enter.prevent />

              <v-text-field v-model="form.slug" label="Slug (URL 友好标识)" variant="outlined"
                hint="用于生成文章 URL，如: my-first-article" class="mb-4" @keydown.enter.prevent />

              <v-textarea v-model="form.content" label="内容 (Markdown)" variant="outlined" rows="25" auto-grow
                class="mb-4" />

              <div class="d-flex ga-2">
                <v-btn color="primary" type="submit" :loading="loading">
                  {{ form.status === 'published' ? '发布文章' : '保存草稿' }}
                </v-btn>
                <v-btn variant="outlined" to="/article">
                  取消
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-expansion-panels v-model="expandedPanels" multiple>
          <v-expansion-panel value="settings">
            <v-expansion-panel-title>
              <v-icon start>
                mdi-cog
              </v-icon>
              文章设置
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row dense>
                <v-col cols="4">
                  <v-select v-model="form.status" :items="statusOptions" label="状态" variant="outlined"
                    density="compact" />
                </v-col>
                <v-col cols="4">
                  <v-select v-model="form.categoryId" :items="categories" item-title="name" item-value="id" label="分类"
                    variant="outlined" clearable density="compact" />
                </v-col>
                <v-col cols="4">
                  <v-select v-model="form.tagIds" :items="tags" item-title="name" item-value="id" label="标签"
                    variant="outlined" multiple chips clearable density="compact" />
                </v-col>
              </v-row>
              <v-row dense class="mt-2">
                <v-col cols="4">
                  <v-select v-model="form.visibility" :items="visibilityOptions" label="可见性" variant="outlined"
                    density="compact" />
                </v-col>
                <v-col v-if="form.visibility === 'password'" cols="4">
                  <v-text-field v-model="form.password" label="访问密码" variant="outlined" density="compact"
                    type="password" @keydown.enter.prevent />
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="form.publishAtDisplay" label="定时发布" variant="outlined" density="compact"
                    type="datetime-local" clearable @keydown.enter.prevent />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel value="meta">
            <v-expansion-panel-title>
              <v-icon start>
                mdi-information-outline
              </v-icon>
              元信息
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field v-model="form.summary" label="摘要" variant="outlined" density="compact"
                    @keydown.enter.prevent />
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="form.coverImage" label="封面图片 URL" variant="outlined" density="compact"
                    @keydown.enter.prevent />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel value="preview">
            <v-expansion-panel-title>
              <v-icon start>
                mdi-eye
              </v-icon>
              预览
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="markdown-body preview-content" v-html="previewContent" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()
const snackbar = useSnackbar()
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
  visibility: 'public',
  password: '',
  publishAtDisplay: '',
  content: ''
})

const loading = ref(false)
const expandedPanels = ref(['settings'])

const categories = computed(() => articleStore.categories)
const tags = computed(() => articleStore.tags)

const statusOptions = [
  { title: '草稿', value: 'draft' },
  { title: '发布', value: 'published' }
]

const visibilityOptions = [
  { title: '公开', value: 'public' },
  { title: '登录可见', value: 'private' },
  { title: '密码保护', value: 'password' }
]

const previewContent = computed(() => {
  return renderMarkdown(form.content)
})

const handleSubmit = async () => {
  loading.value = true

  try {
    const publishAt = form.publishAtDisplay
      ? new Date(form.publishAtDisplay).getTime()
      : undefined

    const result = await articleStore.createArticle({
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
      content: form.content,
      summary: form.summary,
      coverImage: form.coverImage,
      categoryId: form.categoryId || undefined,
      tagIds: form.tagIds,
      status: form.status,
      visibility: form.visibility,
      password: form.visibility === 'password' ? form.password : undefined,
      publishAt
    })

    if (result) {
      snackbar.success('文章创建成功')
      router.push(`/article/${result.id}`)
    } else {
      snackbar.error(articleStore.error || '创建失败')
    }
  } catch (e) {
    snackbar.error(e instanceof Error ? e.message : '创建失败')
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

<style scoped>
.preview-content {
  max-height: 400px;
  overflow-y: auto;
}
</style>
