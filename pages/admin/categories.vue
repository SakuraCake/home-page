<template>
  <v-container max-width="1200">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">
            分类管理
          </h1>
          <v-btn color="primary" @click="openDialog()">
            <v-icon start>
              mdi-plus
            </v-icon>
            添加分类
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-data-table :headers="headers" :items="categories" :loading="loading">
            <template #item.articleCount="{ item }">
              {{ item.articleCount || 0 }}
            </template>
            <template #item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
            <template #item.actions="{ item }">
              <v-btn size="small" variant="text" @click="openDialog(item)">
                编辑
              </v-btn>
              <v-btn size="small" variant="text" color="error" @click="handleDelete(item)">
                删除
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingCategory ? '编辑分类' : '添加分类' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSave">
            <v-text-field v-model="form.name" label="名称" variant="outlined" class="mb-4" />
            <v-text-field v-model="form.slug" label="Slug" variant="outlined" class="mb-4" />
            <v-textarea v-model="form.description" label="描述" variant="outlined" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">
            取消
          </v-btn>
          <v-btn color="primary" :loading="saving" @click="handleSave">
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const router = useRouter()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '管理中心', to: '/admin' },
  { title: '分类管理', disabled: true }
]

const categories = ref<any[]>([])
const loading = ref(true)
const dialog = ref(false)
const saving = ref(false)
const editingCategory = ref<any>(null)

const form = ref({
  name: '',
  slug: '',
  description: ''
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: '名称', key: 'name' },
  { title: 'Slug', key: 'slug' },
  { title: '描述', key: 'description' },
  { title: '文章数', key: 'articleCount' },
  { title: '创建时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false }
]

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/categories')
    if (response.success) {
      categories.value = response.data
    }
  } catch (_e) {
    // ignore
  } finally {
    loading.value = false
  }
}

const openDialog = (category?: any) => {
  editingCategory.value = category || null
  form.value = {
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || ''
  }
  dialog.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    if (editingCategory.value) {
      await $fetch(`/api/categories/${editingCategory.value.id}`, {
        method: 'PUT',
        body: form.value,
        headers: userStore.getAuthHeaders()
      })
    } else {
      await $fetch('/api/categories', {
        method: 'POST',
        body: form.value,
        headers: userStore.getAuthHeaders()
      })
    }
    dialog.value = false
    await fetchCategories()
  } catch (_e) {
    // ignore
  } finally {
    saving.value = false
  }
}

const handleDelete = async (category: any) => {
  if (!confirm(`确定要删除分类"${category.name}"吗？`)) return

  try {
    await $fetch(`/api/categories/${category.id}`, {
      method: 'DELETE',
      headers: userStore.getAuthHeaders()
    })
    await fetchCategories()
  } catch (_e) {
    // ignore
  }
}

useHead({
  title: '分类管理'
})

onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/')
    return
  }
  fetchCategories()
})
</script>
