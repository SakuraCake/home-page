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

    <v-row>
      <v-col
        cols="12"
        lg="8"
      >
        <v-card height="100%">
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
                  :loading="loading"
                >
                  {{ form.status === 'published' ? '发布文章' : '保存草稿' }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  to="/user/articles"
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
                <v-col cols="4">
                  <v-select
                    v-model="form.status"
                    :items="statusOptions"
                    label="状态"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="8">
                  <v-select
                    v-model="form.categoryId"
                    :items="categoryItems"
                    item-title="name"
                    item-value="id"
                    label="分类"
                    variant="outlined"
                    clearable
                    density="compact"
                    @update:model-value="handleCategorySelect"
                  >
                    <template #item="{ item, props }">
                      <v-list-item
                        v-if="item.raw.isCreate"
                        v-bind="props"
                        color="primary"
                      >
                        <template #prepend>
                          <v-icon>mdi-plus</v-icon>
                        </template>
                      </v-list-item>
                      <v-list-item
                        v-else
                        v-bind="props"
                      />
                    </template>
                  </v-select>
                </v-col>
              </v-row>
              <v-row
                dense
                class="mt-2"
              >
                <v-col cols="12">
                  <v-select
                    v-model="form.tagIds"
                    :items="tagItems"
                    item-title="name"
                    item-value="id"
                    label="标签"
                    variant="outlined"
                    multiple
                    chips
                    clearable
                    density="compact"
                    @update:model-value="handleTagSelect"
                  >
                    <template #item="{ item, props }">
                      <v-list-item
                        v-if="item.raw.isCreate"
                        v-bind="props"
                        color="primary"
                      >
                        <template #prepend>
                          <v-icon>mdi-plus</v-icon>
                        </template>
                      </v-list-item>
                      <v-list-item
                        v-else
                        v-bind="props"
                      />
                    </template>
                  </v-select>
                </v-col>
              </v-row>
              <v-row
                dense
                class="mt-2"
              >
                <v-col cols="4">
                  <v-select
                    v-model="form.visibility"
                    :items="visibilityOptions"
                    label="可见性"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col
                  v-if="form.visibility === 'password'"
                  cols="4"
                >
                  <v-text-field
                    v-model="form.password"
                    label="访问密码"
                    variant="outlined"
                    density="compact"
                    type="password"
                    @keydown.enter.prevent
                  />
                </v-col>
              </v-row>
              <v-row
                dense
                class="mt-2"
              >
                <v-col cols="12">
                  <div class="d-flex align-center ga-2">
                    <v-switch
                      v-model="enableScheduledPublish"
                      label="定时发布"
                      color="primary"
                      hide-details
                    />
                  </div>
                </v-col>
                <v-col
                  v-if="enableScheduledPublish"
                  cols="12"
                >
                  <v-menu
                    v-model="showDatePicker"
                    :close-on-content-click="false"
                    location="bottom start"
                  >
                    <template #activator="{ props: datePickerProps }">
                      <v-text-field
                        v-bind="datePickerProps"
                        :model-value="formattedPublishDate"
                        label="发布日期"
                        variant="outlined"
                        density="compact"
                        readonly
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        @click:clear="clearPublishDate"
                      />
                    </template>
                    <v-card min-width="320">
                      <v-date-picker
                        v-model="publishDate"
                        :min="minDate"
                        color="primary"
                        hide-header
                      />
                    </v-card>
                  </v-menu>
                </v-col>
                <v-col
                  v-if="enableScheduledPublish"
                  cols="12"
                >
                  <v-menu
                    v-model="showTimePicker"
                    :close-on-content-click="false"
                    location="bottom start"
                  >
                    <template #activator="{ props: timePickerProps }">
                      <v-text-field
                        v-bind="timePickerProps"
                        :model-value="formattedPublishTime"
                        label="发布时间"
                        variant="outlined"
                        density="compact"
                        readonly
                        prepend-inner-icon="mdi-clock-outline"
                      />
                    </template>
                    <v-card min-width="290">
                      <v-time-picker
                        v-model="publishTime"
                        format="24hr"
                        color="primary"
                        hide-header
                      />
                    </v-card>
                  </v-menu>
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

    <v-dialog
      v-model="showCategoryDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>新建分类</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleCreateCategory">
            <v-text-field
              v-model="newCategory.name"
              label="分类名称"
              variant="outlined"
              class="mb-3"
              @keydown.enter.prevent="handleCreateCategory"
            />
            <v-text-field
              v-model="newCategory.slug"
              label="Slug"
              variant="outlined"
              hint="URL友好标识，如: technology"
              class="mb-3"
              @keydown.enter.prevent="handleCreateCategory"
            />
            <v-text-field
              v-model="newCategory.description"
              label="描述（可选）"
              variant="outlined"
              @keydown.enter.prevent="handleCreateCategory"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeCategoryDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :loading="creatingCategory"
            @click="handleCreateCategory"
          >
            创建
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showTagDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>新建标签</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleCreateTag">
            <v-text-field
              v-model="newTag.name"
              label="标签名称"
              variant="outlined"
              class="mb-3"
              @keydown.enter.prevent="handleCreateTag"
            />
            <v-text-field
              v-model="newTag.slug"
              label="Slug"
              variant="outlined"
              hint="URL友好标识，如: vue"
              @keydown.enter.prevent="handleCreateTag"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeTagDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :loading="creatingTag"
            @click="handleCreateTag"
          >
            创建
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  { title: '我的文章', to: '/user/articles' },
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
  content: ''
})

const loading = ref(false)
const expandedPanels = ref(['settings'])

const enableScheduledPublish = ref(false)
const showDatePicker = ref(false)
const showTimePicker = ref(false)
const publishDate = ref<string | null>(null)
const publishTime = ref<string | null>(null)

const showCategoryDialog = ref(false)
const showTagDialog = ref(false)
const creatingCategory = ref(false)
const creatingTag = ref(false)

const newCategory = reactive({
  name: '',
  slug: '',
  description: ''
})

const newTag = reactive({
  name: '',
  slug: ''
})

const categories = computed(() => articleStore.categories)
const tags = computed(() => articleStore.tags)

const CREATE_CATEGORY_VALUE = '__create_new__'
const CREATE_TAG_VALUE = '__create_new__'

const categoryItems = computed(() => [
  { id: CREATE_CATEGORY_VALUE, name: '新建分类...', isCreate: true },
  ...categories.value.map(c => ({ ...c, isCreate: false }))
])

const tagItems = computed(() => [
  { id: CREATE_TAG_VALUE, name: '新建标签...', isCreate: true },
  ...tags.value.map(t => ({ ...t, isCreate: false }))
])

const statusOptions = [
  { title: '草稿', value: 'draft' },
  { title: '发布', value: 'published' }
]

const visibilityOptions = [
  { title: '公开', value: 'public' },
  { title: '登录可见', value: 'private' },
  { title: '密码保护', value: 'password' }
]

const minDate = computed(() => {
  const now = new Date()
  return now.toISOString().split('T')[0]
})

const formattedPublishDate = computed(() => {
  if (!publishDate.value) return ''
  const date = new Date(publishDate.value)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedPublishTime = computed(() => {
  if (!publishTime.value) return ''
  const [hours, minutes] = publishTime.value.split(':')
  return `${hours}:${minutes}`
})

const previewContent = computed(() => {
  return renderMarkdown(form.content)
})

function clearPublishDate() {
  publishDate.value = null
  publishTime.value = null
}

function handleCategorySelect(value: string | number | null) {
  if (value === CREATE_CATEGORY_VALUE) {
    form.categoryId = null
    showCategoryDialog.value = true
  }
}

function handleTagSelect(value: (string | number)[]) {
  if (value.includes(CREATE_TAG_VALUE)) {
    form.tagIds = value.filter((v): v is number => typeof v === 'number')
    showTagDialog.value = true
  }
}

function closeCategoryDialog() {
  showCategoryDialog.value = false
  newCategory.name = ''
  newCategory.slug = ''
  newCategory.description = ''
}

function closeTagDialog() {
  showTagDialog.value = false
  newTag.name = ''
  newTag.slug = ''
}

async function handleCreateCategory() {
  if (!newCategory.name || !newCategory.slug) {
    snackbar.error('请填写分类名称和 Slug')
    return
  }

  creatingCategory.value = true
  try {
    const response: any = await $fetch('/api/categories', {
      method: 'POST',
      body: {
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description || undefined
      },
      headers: userStore.getAuthHeaders()
    })

    if (response.success && response.data?.id) {
      snackbar.success('分类创建成功')
      await articleStore.fetchCategories()
      form.categoryId = response.data.id
      closeCategoryDialog()
    } else {
      snackbar.error(response.message || '创建失败')
    }
  } catch (e: any) {
    snackbar.error(e?.data?.message || '创建失败')
  } finally {
    creatingCategory.value = false
  }
}

async function handleCreateTag() {
  if (!newTag.name || !newTag.slug) {
    snackbar.error('请填写标签名称和 Slug')
    return
  }

  creatingTag.value = true
  try {
    const response: any = await $fetch('/api/tags', {
      method: 'POST',
      body: {
        name: newTag.name,
        slug: newTag.slug
      },
      headers: userStore.getAuthHeaders()
    })

    if (response.success && response.data?.id) {
      snackbar.success('标签创建成功')
      await articleStore.fetchTags()
      form.tagIds.push(response.data.id)
      closeTagDialog()
    } else {
      snackbar.error(response.message || '创建失败')
    }
  } catch (e: any) {
    snackbar.error(e?.data?.message || '创建失败')
  } finally {
    creatingTag.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true

  try {
    let publishAt: number | undefined
    if (enableScheduledPublish.value && publishDate.value && publishTime.value) {
      const dateTimeStr = `${publishDate.value}T${publishTime.value}:00`
      publishAt = new Date(dateTimeStr).getTime()
    }

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
