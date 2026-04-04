<template>
  <div class="mdui-container" style="max-width: 600px; margin-top: 48px;">
    <mdui-card>
      <mdui-card-header>
        <div class="mdui-card-header__title">登录</div>
      </mdui-card-header>
      <mdui-divider />
      <mdui-card-content>
        <form @submit.prevent="handleSubmit">
          <mdui-text-field
            v-model="username"
            label="用户名"
            variant="outlined"
            required
            class="mb-4"
          />

          <mdui-text-field
            v-model="password"
            label="密码"
            type="password"
            variant="outlined"
            required
            class="mb-4"
          />

          <mdui-button
            type="submit"
            variant="filled"
            color="primary"
            full-width
            :loading="loading || isLoading"
          >
            登录
          </mdui-button>
        </form>

        <mdui-divider class="my-6" />

        <div class="text-center">
          <span class="mdui-text-color-text-secondary">还没有账号？</span>
          <mdui-button v-if="allowRegister" variant="text" href="/register">
            立即注册
          </mdui-button>
          <span v-else class="mdui-text-color-text-disabled">注册已关闭</span>
        </div>
      </mdui-card-content>
    </mdui-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { useSnackbar } from '~/composables/useSnackbar'
import { useGeetest } from '~/composables/useGeetest'
import { useSiteConfig } from '~/composables/useSiteConfig'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const snackbar = useSnackbar()
const { isReady, isVerified, validateResult, isLoading, init, verify, reset } = useGeetest()
const { fetchConfig, captchaLoginEnabled, allowRegister } = useSiteConfig()

const username = ref('')
const password = ref('')
const loading = ref(false)
const needCaptcha = ref(true)

const submitForm = async () => {
  if (needCaptcha.value && !validateResult.value) {
    snackbar.error('请完成验证码验证')
    return
  }

  loading.value = true

  const captchaData = needCaptcha.value && validateResult.value ? {
    geetest_challenge: validateResult.value.geetest_challenge,
    geetest_validate: validateResult.value.geetest_validate,
    geetest_seccode: validateResult.value.geetest_seccode,
  } : {
    geetest_challenge: '',
    geetest_validate: '',
    geetest_seccode: '',
  }

  const success = await userStore.login(username.value, password.value, captchaData)

  if (success) {
    snackbar.success('登录成功')
    const redirect = route.query.redirect as string || '/article'
    router.push(redirect)
  } else {
    snackbar.error(userStore.error || '登录失败')
    reset()
  }

  loading.value = false
}

const handleSubmit = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    snackbar.error('请输入用户名和密码')
    return
  }

  if (needCaptcha.value) {
    if (!isReady.value) {
      await init()
    }
    verify()
  } else {
    await submitForm()
  }
}

watch(isVerified, async (verified) => {
  if (verified) {
    await submitForm()
  }
})

useHead({
  title: '登录'
})

onMounted(async () => {
  if (userStore.isLoggedIn) {
    router.push('/article')
  } else {
    await fetchConfig()
    needCaptcha.value = captchaLoginEnabled.value
    if (needCaptcha.value) {
      init()
    }
  }
})
</script>
