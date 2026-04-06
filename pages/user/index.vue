<template>
  <v-container max-width="900">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center py-8">
            <v-avatar size="100" class="mb-4">
              <v-icon v-if="!userStore.user?.avatar" size="60">
                mdi-account
              </v-icon>
              <v-img v-else :src="userStore.user.avatar" />
            </v-avatar>
            <h2 class="text-h5 mb-2">
              {{ userStore.user?.username }}
            </h2>
            <v-chip size="small" :color="userStore.isAdmin ? 'primary' : 'default'">
              {{ userStore.isAdmin ? '管理员' : '普通用户' }}
            </v-chip>
            <p class="text-caption text-medium-emphasis mt-2">
              注册于 {{ formatDate(userStore.user?.createdAt || 0) }}
            </p>
          </v-card-text>
          <v-divider />
          <v-list>
            <v-list-item to="/user/articles">
              <template #prepend>
                <v-icon>mdi-file-document-multiple</v-icon>
              </template>
              <v-list-item-title>我的文章</v-list-item-title>
              <template #append>
                <v-chip size="small">
                  {{ articleCount }}
                </v-chip>
              </template>
            </v-list-item>
            <v-list-item to="/user/comments">
              <template #prepend>
                <v-icon>mdi-comment-multiple</v-icon>
              </template>
              <v-list-item-title>我的评论</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>个人信息</v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleUpdateProfile">
              <v-text-field v-model="form.username" label="用户名" variant="outlined" disabled class="mb-4" />
              <v-text-field v-model="form.email" label="邮箱" type="email" variant="outlined" class="mb-4" />
              <v-text-field v-model="form.avatar" label="头像 URL" variant="outlined" class="mb-4" />

              <v-btn color="primary" type="submit" :loading="loading">
                保存更改
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>修改密码</v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleChangePassword">
              <v-text-field v-model="passwordForm.oldPassword" label="当前密码" type="password" variant="outlined"
                class="mb-4" />
              <v-text-field v-model="passwordForm.newPassword" label="新密码" type="password" variant="outlined"
                class="mb-4" />
              <v-text-field v-model="passwordForm.confirmPassword" label="确认新密码" type="password" variant="outlined"
                class="mb-4" />

              <v-btn color="primary" type="submit" :loading="passwordLoading">
                修改密码
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { ApiResponse } from '~/types/api'

interface ArticleCountResponse {
  count: number
}

const userStore = useUserStore()
const router = useRouter()
const snackbar = useSnackbar()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '用户中心', disabled: true }
]

const form = ref({
  username: '',
  email: '',
  avatar: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const passwordLoading = ref(false)
const articleCount = ref(0)

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleUpdateProfile = async () => {
  loading.value = true

  try {
    const response = await $fetch<ApiResponse>('/api/user/profile', {
      method: 'PUT',
      body: {
        email: form.value.email,
        avatar: form.value.avatar
      },
      headers: userStore.getAuthHeaders()
    })

    if (response.success) {
      snackbar.success('保存成功')
      await userStore.fetchUser()
    } else {
      snackbar.error(response.message || '保存失败')
    }
  } catch (_e) {
    snackbar.error('保存失败')
  } finally {
    loading.value = false
  }
}

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    snackbar.error('两次密码不一致')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    snackbar.error('密码至少 6 个字符')
    return
  }

  passwordLoading.value = true

  try {
    const response = await $fetch<ApiResponse>('/api/user/password', {
      method: 'PUT',
      body: {
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword
      },
      headers: userStore.getAuthHeaders()
    })

    if (response.success) {
      snackbar.success('密码修改成功')
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      snackbar.error(response.message || '密码修改失败')
    }
  } catch (_e) {
    snackbar.error('密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

const fetchArticleCount = async () => {
  try {
    const response = await $fetch<ApiResponse<ArticleCountResponse>>('/api/user/articles/count', {
      headers: userStore.getAuthHeaders()
    })
    if (response.success && response.data) {
      articleCount.value = response.data.count
    }
  } catch (_e) {
  }
}

useHead({
  title: '用户中心'
})

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  form.value = {
    username: userStore.user?.username || '',
    email: userStore.user?.email || '',
    avatar: userStore.user?.avatar || ''
  }

  fetchArticleCount()
})
</script>
