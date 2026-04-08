<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 py-4 px-6">
            验证码配置
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <div
              v-if="loading"
              class="text-center py-4"
            >
              <v-progress-circular indeterminate />
            </div>

            <v-form
              v-else
              ref="form"
              @submit.prevent="saveConfig"
            >
              <v-switch
                v-model="config.enabled"
                label="启用验证码"
                color="tertiary"
                class="mb-4"
                inset
              />

              <v-select
                v-model="config.provider"
                label="验证码提供商"
                :items="providers"
                variant="outlined"
                class="mb-4"
              />

              <v-text-field
                v-model="config.siteKey"
                label="Site Key / ID"
                variant="outlined"
                class="mb-4"
              />

              <v-text-field
                v-model="config.secretKey"
                label="Secret Key"
                variant="outlined"
                type="password"
                class="mb-4"
              />

              <v-divider class="my-4" />

              <div class="text-subtitle-1 mb-4">
                应用场景
              </div>

              <v-switch
                v-model="config.loginEnabled"
                label="登录时启用"
                color="tertiary"
                class="mb-2"
                inset
              />

              <v-switch
                v-model="config.registerEnabled"
                label="注册时启用"
                color="tertiary"
                class="mb-2"
                inset
              />

              <v-switch
                v-model="config.commentEnabled"
                label="评论时启用（匿名用户）"
                color="tertiary"
                class="mb-4"
                inset
              />

              <v-btn
                color="primary"
                type="submit"
                :loading="saving"
              >
                保存配置
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { ApiResponse } from '#shared/types/api'

interface CaptchaConfigResponse {
  enabled: boolean
  provider: string
  siteKey: string
  loginEnabled: boolean
  registerEnabled: boolean
  commentEnabled: boolean
}

interface CaptchaConfigRequest {
  enabled: boolean
  provider: string
  siteKey: string
  secretKey: string
  loginEnabled: boolean
  registerEnabled: boolean
  commentEnabled: boolean
}

const userStore = useUserStore()
const snackbar = useSnackbar()

const loading = ref(true)
const saving = ref(false)

const providers = [
  { title: '极验 (GeeTest)', value: 'geetest' },
  { title: 'Google reCAPTCHA', value: 'recaptcha', disabled: true },
  { title: 'hCaptcha', value: 'hcaptcha', disabled: true },
]

const config = ref<CaptchaConfigRequest>({
  enabled: true,
  provider: 'geetest',
  siteKey: '',
  secretKey: '',
  loginEnabled: true,
  registerEnabled: true,
  commentEnabled: true,
})

const loadConfig = async () => {
  loading.value = true
  try {
    const response = await $fetch<ApiResponse<CaptchaConfigResponse>>('/api/captcha/config')
    if (response.success && response.data) {
      config.value = {
        enabled: response.data.enabled,
        provider: response.data.provider,
        siteKey: response.data.siteKey,
        secretKey: '',
        loginEnabled: response.data.loginEnabled,
        registerEnabled: response.data.registerEnabled,
        commentEnabled: response.data.commentEnabled,
      }
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
    const response = await $fetch<ApiResponse>('/api/admin/captcha', {
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
  title: '验证码配置'
})

onMounted(() => {
  loadConfig()
})
</script>
