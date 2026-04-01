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
            <v-form ref="form" @submit.prevent="handleSubmit">
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

              <v-alert v-if="error" type="error" class="mb-4">
                {{ error }}
              </v-alert>

              <v-btn
                color="primary"
                type="submit"
                block
                :loading="loading"
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

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = '两次密码不一致'
    return
  }

  error.value = ''
  loading.value = true

  const success = await userStore.register(
    username.value,
    password.value,
    email.value || undefined
  )

  if (success) {
    router.push('/article')
  } else {
    error.value = userStore.error || '注册失败'
  }

  loading.value = false
}

useHead({
  title: '注册'
})

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/article')
  }
})
</script>
