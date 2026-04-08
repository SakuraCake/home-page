<template>
  <v-container
    fluid
    class="pa-4"
  >
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs
          :items="breadcrumbs"
          class="pa-0 mb-4"
        />
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col
        cols="12"
        lg="8"
      >
        <v-card height="100%">
          <v-card-title class="text-h4 py-4 px-6">
            <v-skeleton-loader
              type="text"
              width="120"
            />
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-skeleton-loader
              type="text"
              class="mb-4"
            />
            <v-skeleton-loader
              type="text"
              class="mb-4"
            />
            <v-skeleton-loader
              type="textarea"
              height="400"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        lg="4"
      >
        <v-card class="mb-4">
          <v-card-title>
            <v-skeleton-loader
              type="text"
              width="100"
            />
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader type="text@3" />
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title>
            <v-skeleton-loader
              type="text"
              width="80"
            />
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader type="text@2" />
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

    <v-row v-else-if="article">
      <v-col
        cols="12"
        lg="8"
      >
        <v-card height="100%">
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
                hint="用于生成文章 URL，如: my-first-article"
                class="mb-4"
                @keydown.enter.prevent
              />

              <v-textarea
                v-model="form.content"
                label="内容 (Markdown)"
                variant="outlined"
                rows="25"
                auto-grow
                class="mb-4"
              />

              <div class="d-flex ga-2">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="submitting"
                >
                  保存更改
                </v-btn>
                <v-btn
                  variant="outlined"
                  :to="`/article/${id}`"
                >
                  取消
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        lg="4"
      >
        <v-expansion-panels
          v-model="expandedPanels"
          multiple
        >
          <v-expansion-panel value="settings">
            <v-expansion-panel-title>
              <v-icon start>
                mdi-cog
              </v-icon>
              文章设置
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row dense>
                <v-col cols="12">
                  <v-select
                    v-model="form.status"
                    :items="statusOptions"
                    label="状态"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="6">
                  <v-select
                    v-model="form.categoryId"
                    :items="categories"
                    item-title="name"
                    item-value="id"
                    label="分类"
                    variant="outlined"
                    clearable
                    density="compact"
                  />
                </v-col>
                <v-col cols="6">
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
                    density="compact"
                  />
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
                  <v-text-field
                    v-model="form.summary"
                    label="摘要"
                    variant="outlined"
                    density="compact"
                    @keydown.enter.prevent
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.coverImage"
                    label="封面图片 URL"
                    variant="outlined"
                    density="compact"
                    @keydown.enter.prevent
                  />
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
              <div
                class="markdown-body preview-content"
                v-html="previewContent"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()
const snackbar = useSnackbar()
const { renderMarkdown } = useMarkdown()

const id = computed(() => Number(route.params.id))
const article = computed(() => articleStore.currentArticle)
const loading = ref(true)
const error = ref('')
const submitting = ref(false)

const expandedPanels = ref(['settings'])

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

const previewContent = computed(() => {
  return renderMarkdown(form.content)
})

const handleSubmit = async () => {
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
      snackbar.success('文章保存成功')
      router.push(`/article/${id.value}`)
    } else {
      snackbar.error(articleStore.error || '保存失败')
    }
  } catch (e) {
    snackbar.error(e instanceof Error ? e.message : '保存失败')
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
  } catch (_e) {
    error.value = '加载文章失败'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  articleStore.clearCurrentArticle()
})
</script>

<style scoped>
.preview-content {
  max-height: 400px;
  overflow-y: auto;
}
</style>
