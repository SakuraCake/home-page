<template>
  <v-container max-width="1200">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 py-4 px-6">
            系统设置
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <div v-if="loading" class="text-center py-4">
              <v-progress-circular indeterminate />
            </div>

            <v-form v-else ref="form" @submit.prevent="saveConfig">
              <v-tabs v-model="activeTab" class="mb-6">
                <v-tab value="basic">
                  基本设置
                </v-tab>
                <v-tab value="display">
                  显示设置
                </v-tab>
                <v-tab value="function">
                  功能设置
                </v-tab>
              </v-tabs>

              <v-window v-model="activeTab">
                <v-window-item value="basic">
                  <v-text-field v-model="config.siteName" label="网站名称" variant="outlined" class="mb-4" />

                  <v-textarea v-model="config.siteDescription" label="网站描述" variant="outlined" rows="3" class="mb-4" />

                  <v-text-field v-model="config.siteKeywords" label="网站关键词" variant="outlined" hint="多个关键词用英文逗号分隔"
                    class="mb-4" />

                  <v-text-field v-model="config.siteUrl" label="网站地址" variant="outlined" hint="例如：https://example.com"
                    class="mb-4" />
                </v-window-item>

                <v-window-item value="display">
                  <v-text-field v-model="config.logo" label="Logo URL" variant="outlined" class="mb-4" />

                  <v-text-field v-model="config.favicon" label="Favicon URL" variant="outlined" class="mb-4" />

                  <v-text-field v-model="config.postsPerPage" label="每页文章数" variant="outlined" type="number"
                    class="mb-4" />

                  <v-textarea v-model="config.footerText" label="页脚文字" variant="outlined" rows="2" class="mb-4" />

                  <v-text-field v-model="config.icp" label="ICP 备案号" variant="outlined" class="mb-4" />

                  <v-textarea v-model="config.analyticsCode" label="统计代码" variant="outlined" rows="4"
                    hint="如 Google Analytics、百度统计等" class="mb-4" />
                </v-window-item>

                <v-window-item value="function">
                  <v-switch v-model="config.allowRegister" label="允许用户注册" color="tertiary" class="mb-4" inset />

                  <v-switch v-model="config.allowComment" label="允许评论" color="tertiary" class="mb-4" inset />

                  <v-switch v-model="config.commentNeedReview" label="评论需要审核" color="tertiary" class="mb-4" inset />
                </v-window-item>
              </v-window>

              <v-btn color="primary" type="submit" :loading="saving">
                保存设置
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { SiteConfig, ApiResponse } from '~/types/api'

const userStore = useUserStore()
const router = useRouter()
const snackbar = useSnackbar()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '管理中心', to: '/admin' },
  { title: '系统设置', disabled: true }
]

const loading = ref(true)
const saving = ref(false)
const activeTab = ref('basic')

const config = ref<SiteConfig>({
  siteName: '',
  siteDescription: '',
  siteKeywords: '',
  siteUrl: '',
  logo: '',
  favicon: '',
  footerText: '',
  icp: '',
  analyticsCode: '',
  postsPerPage: 10,
  allowRegister: true,
  allowComment: true,
  commentNeedReview: false,
})

const loadConfig = async () => {
  loading.value = true
  try {
    const response = await $fetch<ApiResponse<SiteConfig>>('/api/config/site')
    if (response.success && response.data) {
      config.value = { ...response.data }
    }
  } catch (_e) {
    snackbar.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true

  try {
    const response = await $fetch<ApiResponse>('/api/admin/site', {
      method: 'PUT',
      body: config.value,
      headers: userStore.getAuthHeaders(),
    })

    if (response.success) {
      snackbar.success('保存成功')
    } else {
      snackbar.error(response.message || '保存失败')
    }
  } catch (_e) {
    snackbar.error('保存失败')
  } finally {
    saving.value = false
  }
}

useHead({
  title: '系统设置'
})

onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/')
    return
  }
  loadConfig()
})
</script>
