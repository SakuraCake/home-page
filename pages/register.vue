<template>
  <v-container max-width="600">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 py-4 px-6">
            注册
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-alert v-if="!allowRegister" type="warning" class="mb-4">
              系统已关闭注册功能
            </v-alert>

            <v-form v-else ref="form" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="username"
                label="用户名"
                variant="outlined"
                :rules="[
                  v => !!v || '请输入用户名',
                  v => v.length >= 3 || '用户名至少 3 个字符'
                ]"
                class="mb-4"
              />

              <v-text-field
                v-model="email"
                label="邮箱 (可选)"
                type="email"
                variant="outlined"
                class="mb-4"
              />

              <v-text-field
                v-model="password"
                label="密码"
                type="password"
                variant="outlined"
                :rules="[
                  v => !!v || '请输入密码',
                  v => v.length >= 6 || '密码至少 6 个字符'
                ]"
                class="mb-4"
              />

              <v-text-field
                v-model="confirmPassword"
                label="确认密码"
                type="password"
                variant="outlined"
                :rules="[
                  v => !!v || '请确认密码',
                  v => v === password || '两次密码不一致'
                ]"
                class="mb-4"
              />

              <v-btn
                color="primary"
                type="submit"
                block
                :loading="loading || isLoading"
              >
                注册
              </v-btn>
            </v-form>

            <v-divider class="my-6" />

            <div class="text-center">
              <span class="text-medium-emphasis">已有账号？</span>
              <v-btn variant="text" to="/login">
                立即登录
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const router = useRouter()
const userStore = useUserStore()
const snackbar = useSnackbar()
const { isReady, isVerified, validateResult, isLoading, init, verify, reset } = useGeetest()
const { fetchConfig, captchaRegisterEnabled, allowRegister } = useSiteConfig()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
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

  const success = await userStore.register(
    username.value,
    password.value,
    captchaData,
    email.value || undefined
  )

  if (success) {
    snackbar.success('注册成功')
    router.push('/article')
  } else {
    snackbar.error(userStore.error || '注册失败')
    reset()
  }

  loading.value = false
}

const handleSubmit = async () => {
  if (!allowRegister.value) {
    snackbar.error('系统已关闭注册功能')
    return
  }

  if (password.value !== confirmPassword.value) {
    snackbar.error('两次密码不一致')
    return
  }

  if (!username.value.trim() || !password.value.trim()) {
    snackbar.error('请填写用户名和密码')
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
  title: '注册'
})

onMounted(async () => {
  if (userStore.isLoggedIn) {
    router.push('/article')
  } else {
    await fetchConfig()
    needCaptcha.value = captchaRegisterEnabled.value
    if (needCaptcha.value && allowRegister.value) {
      init()
    }
  }
})
</script>
