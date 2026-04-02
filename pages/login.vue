<template>
  <v-container max-width="600">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 py-4 px-6">
            登录
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-form ref="form" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="username"
                label="用户名"
                variant="outlined"
                :rules="[v => !!v || '请输入用户名']"
                class="mb-4"
              />

              <v-text-field
                v-model="password"
                label="密码"
                type="password"
                variant="outlined"
                :rules="[v => !!v || '请输入密码']"
                class="mb-4"
              />

              <v-btn
                color="primary"
                type="submit"
                block
                :loading="loading || isLoading"
              >
                登录
              </v-btn>
            </v-form>

            <v-divider class="my-6" />

            <div class="text-center">
              <span class="text-medium-emphasis">还没有账号？</span>
              <v-btn v-if="allowRegister" variant="text" to="/register">
                立即注册
              </v-btn>
              <span v-else class="text-disabled">注册已关闭</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
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
