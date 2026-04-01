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
          <h1 class="text-h4">用户管理</h1>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card>
          <ClientOnly>
            <v-data-table
              :headers="headers"
              :items="users"
              :loading="loading"
            >
              <template #item.role="{ item }">
                <v-chip
                  size="small"
                  :color="item.role === 'admin' ? 'primary' : 'default'"
                >
                  {{ item.role === 'admin' ? '管理员' : '普通用户' }}
                </v-chip>
              </template>
              <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template #item.actions="{ item }">
                <v-btn
                  v-if="item.id !== userStore.user?.id"
                  size="small"
                  variant="text"
                  :color="item.role === 'admin' ? 'warning' : 'primary'"
                  @click="toggleAdmin(item)"
                >
                  {{ item.role === 'admin' ? '取消管理员' : '设为管理员' }}
                </v-btn>
                <span v-else class="text-medium-emphasis text-caption">
                  当前用户
                </span>
              </template>
            </v-data-table>
          </ClientOnly>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const router = useRouter()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '管理中心', to: '/admin' },
  { title: '用户管理', disabled: true }
]

const users = ref<any[]>([])
const loading = ref(true)

const headers = [
  { title: 'ID', key: 'id' },
  { title: '用户名', key: 'username' },
  { title: '邮箱', key: 'email' },
  { title: '角色', key: 'role' },
  { title: '注册时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false }
]

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/users', {
      headers: userStore.getAuthHeaders()
    })
    if (response.success) {
      users.value = response.data
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

const toggleAdmin = async (user: any) => {
  try {
    const response = await $fetch(`/api/admin/users/${user.id}/role`, {
      method: 'PUT',
      body: {
        role: user.role === 'admin' ? 'user' : 'admin'
      },
      headers: userStore.getAuthHeaders()
    })

    if (response.success) {
      await fetchUsers()
    }
  } catch (e) {
    // ignore
  }
}

useHead({
  title: '用户管理'
})

onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/')
    return
  }
  fetchUsers()
})
</script>
