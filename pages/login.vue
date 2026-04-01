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

              <v-alert v-if="error" type="error" class="mb-4">
                {{ error }}
              </v-alert>

              <v-btn
                color="primary"
                type="submit"
                block
                :loading="loading"
              >
                登录
              </v-btn>
            </v-form>

            <v-divider class="my-6" />

            <div class="text-center">
              <span class="text-medium-emphasis">还没有账号？</span>
              <v-btn variant="text" to="/register">
                立即注册
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
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  const success = await userStore.login(username.value, password.value)

  if (success) {
    const redirect = route.query.redirect as string || '/article'
    router.push(redirect)
  } else {
    error.value = userStore.error || '登录失败'
  }

  loading.value = false
}

useHead({
  title: '登录'
})

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/article')
  }
})
</script>
