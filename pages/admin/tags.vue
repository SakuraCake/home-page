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
          <h1 class="text-h4">标签管理</h1>
          <v-btn color="primary" @click="openDialog()">
            <v-icon start>mdi-plus</v-icon>
            添加标签
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="tags"
            :loading="loading"
          >
            <template #item.articleCount="{ item }">
              {{ item.articleCount || 0 }}
            </template>
            <template #item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
            <template #item.actions="{ item }">
              <v-btn
                size="small"
                variant="text"
                @click="openDialog(item)"
              >
                编辑
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                color="error"
                @click="handleDelete(item)"
              >
                删除
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>{{ editingTag ? '编辑标签' : '添加标签' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSave">
            <v-text-field
              v-model="form.name"
              label="名称"
              variant="outlined"
              class="mb-4"
            />
            <v-text-field
              v-model="form.slug"
              label="Slug"
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">取消</v-btn>
          <v-btn color="primary" :loading="saving" @click="handleSave">保存</v-btn>
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
  { title: '标签管理', disabled: true }
]

const tags = ref<any[]>([])
const loading = ref(true)
const dialog = ref(false)
const saving = ref(false)
const editingTag = ref<any>(null)

const form = ref({
  name: '',
  slug: ''
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: '名称', key: 'name' },
  { title: 'Slug', key: 'slug' },
  { title: '文章数', key: 'articleCount' },
  { title: '创建时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false }
]

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const fetchTags = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/tags')
    if (response.success) {
      tags.value = response.data
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

const openDialog = (tag?: any) => {
  editingTag.value = tag || null
  form.value = {
    name: tag?.name || '',
    slug: tag?.slug || ''
  }
  dialog.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    if (editingTag.value) {
      await $fetch(`/api/tags/${editingTag.value.id}`, {
        method: 'PUT',
        body: form.value,
        headers: userStore.getAuthHeaders()
      })
    } else {
      await $fetch('/api/tags', {
        method: 'POST',
        body: form.value,
        headers: userStore.getAuthHeaders()
      })
    }
    dialog.value = false
    await fetchTags()
  } catch (e) {
    // ignore
  } finally {
    saving.value = false
  }
}

const handleDelete = async (tag: any) => {
  if (!confirm(`确定要删除标签"${tag.name}"吗？`)) return

  try {
    await $fetch(`/api/tags/${tag.id}`, {
      method: 'DELETE',
      headers: userStore.getAuthHeaders()
    })
    await fetchTags()
  } catch (e) {
    // ignore
  }
}

useHead({
  title: '标签管理'
})

onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/')
    return
  }
  fetchTags()
})
</script>
