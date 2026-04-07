<template>
  <v-container max-width="900">
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
        md="4"
      >
        <v-card>
          <v-card-text class="text-center py-8">
            <v-avatar
              size="100"
              class="mb-4"
            >
              <v-icon
                v-if="!userStore.user?.avatar"
                size="60"
              >
                mdi-account
              </v-icon>
              <v-img
                v-else
                :src="userStore.user.avatar"
              />
            </v-avatar>
            <h2 class="text-h5 mb-2">
              {{ userStore.user?.username }}
            </h2>
            <v-chip
              size="small"
              :color="userStore.isAdmin ? 'primary' : 'default'"
            >
              {{ userStore.isAdmin ? '管理员' : '普通用户' }}
            </v-chip>
            <p
              v-if="userStore.user?.bio"
              class="text-body-2 text-medium-emphasis mt-3 px-4"
            >
              {{ userStore.user.bio }}
            </p>
            <p class="text-caption text-medium-emphasis mt-2">
              注册于 {{ formatDate(userStore.user?.createdAt || 0) }}
            </p>
            <div
              v-if="hasSocialLinks"
              class="d-flex justify-center ga-2 mt-3"
            >
              <v-btn
                v-if="userStore.user?.website"
                :href="userStore.user.website"
                target="_blank"
                icon
                size="small"
                variant="text"
              >
                <v-icon>mdi-web</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  个人网站
                </v-tooltip>
              </v-btn>
              <v-btn
                v-if="userStore.user?.github"
                :href="`https://github.com/${userStore.user.github}`"
                target="_blank"
                icon
                size="small"
                variant="text"
              >
                <v-icon>mdi-github</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  GitHub
                </v-tooltip>
              </v-btn>
              <v-btn
                v-if="userStore.user?.twitter"
                :href="`https://twitter.com/${userStore.user.twitter}`"
                target="_blank"
                icon
                size="small"
                variant="text"
              >
                <v-icon>mdi-twitter</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  Twitter
                </v-tooltip>
              </v-btn>
              <v-btn
                v-if="userStore.user?.weibo"
                :href="`https://weibo.com/${userStore.user.weibo}`"
                target="_blank"
                icon
                size="small"
                variant="text"
              >
                <v-icon>mdi-sina-weibo</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                >
                  微博
                </v-tooltip>
              </v-btn>
            </div>
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

      <v-col
        cols="12"
        md="8"
      >
        <v-card>
          <v-card-title>个人信息</v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleUpdateProfile">
              <v-text-field
                v-model="form.username"
                label="用户名"
                variant="outlined"
                disabled
                class="mb-4"
              />
              <v-text-field
                v-model="form.email"
                label="邮箱"
                type="email"
                variant="outlined"
                class="mb-4"
              />
              <v-text-field
                v-model="form.avatar"
                label="头像 URL"
                variant="outlined"
                class="mb-4"
              />
              <v-textarea
                v-model="form.bio"
                label="个人简介"
                variant="outlined"
                rows="3"
                counter="200"
                class="mb-4"
              />

              <v-divider class="mb-4" />

              <h3 class="text-subtitle-1 mb-3">
                社交链接
              </h3>
              <v-text-field
                v-model="form.website"
                label="个人网站"
                variant="outlined"
                prepend-inner-icon="mdi-web"
                placeholder="https://example.com"
                class="mb-4"
              />
              <v-text-field
                v-model="form.github"
                label="GitHub"
                variant="outlined"
                prepend-inner-icon="mdi-github"
                placeholder="用户名"
                class="mb-4"
              />
              <v-text-field
                v-model="form.twitter"
                label="Twitter"
                variant="outlined"
                prepend-inner-icon="mdi-twitter"
                placeholder="用户名"
                class="mb-4"
              />
              <v-text-field
                v-model="form.weibo"
                label="微博"
                variant="outlined"
                prepend-inner-icon="mdi-sina-weibo"
                placeholder="用户名或UID"
                class="mb-4"
              />

              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
              >
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
              <v-text-field
                v-model="passwordForm.oldPassword"
                label="当前密码"
                type="password"
                variant="outlined"
                class="mb-4"
              />
              <v-text-field
                v-model="passwordForm.newPassword"
                label="新密码"
                type="password"
                variant="outlined"
                class="mb-4"
              />
              <v-text-field
                v-model="passwordForm.confirmPassword"
                label="确认新密码"
                type="password"
                variant="outlined"
                class="mb-4"
              />

              <v-btn
                color="primary"
                type="submit"
                :loading="passwordLoading"
              >
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
  avatar: '',
  bio: '',
  website: '',
  github: '',
  twitter: '',
  weibo: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const passwordLoading = ref(false)
const articleCount = ref(0)

const hasSocialLinks = computed(() => {
  return userStore.user?.website || userStore.user?.github || userStore.user?.twitter || userStore.user?.weibo
})

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
        avatar: form.value.avatar,
        bio: form.value.bio,
        website: form.value.website,
        github: form.value.github,
        twitter: form.value.twitter,
        weibo: form.value.weibo
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
    avatar: userStore.user?.avatar || '',
    bio: (userStore.user as any)?.bio || '',
    website: (userStore.user as any)?.website || '',
    github: (userStore.user as any)?.github || '',
    twitter: (userStore.user as any)?.twitter || '',
    weibo: (userStore.user as any)?.weibo || ''
  }

  fetchArticleCount()
})
</script>
