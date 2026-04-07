<template>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="10"
        md="8"
        lg="6"
      >
        <v-card
          class="mx-auto"
          :loading="loading"
        >
          <v-card-title class="text-h4 text-center pa-6">
            <v-icon
              size="48"
              color="primary"
              class="mb-2"
            >
              mdi-rocket-launch
            </v-icon>
            <div>安装向导</div>
            <div class="text-subtitle-1 text-medium-emphasis mt-2">
              欢迎使用 SakuraCake 博客系统
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <v-stepper
              v-model="currentStep"
              :items="steps"
              alt-labels
              :editable="!setupComplete"
              :disabled="loading || setupComplete"
            >
              <template #[`item.1`]>
                <div class="pa-4">
                  <h3 class="text-h6 mb-4">
                    欢迎使用
                  </h3>
                  <p class="text-body-1 mb-4">
                    这是您第一次运行 SakuraCake 博客系统。让我们完成一些基本配置，让您的博客快速上线。
                  </p>

                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    整个安装过程只需要几分钟，请按照提示完成以下步骤。
                  </v-alert>

                  <v-list>
                    <v-list-item
                      prepend-icon="mdi-numeric-1-circle"
                      title="配置网站基本信息"
                    />
                    <v-list-item
                      prepend-icon="mdi-numeric-2-circle"
                      title="创建管理员账户"
                    />
                    <v-list-item
                      prepend-icon="mdi-numeric-3-circle"
                      title="确认配置信息"
                    />
                    <v-list-item
                      prepend-icon="mdi-numeric-4-circle"
                      title="完成安装"
                    />
                  </v-list>
                </div>
              </template>

              <template #[`item.2`]>
                <v-form
                  ref="siteForm"
                  v-model="forms.site.valid"
                  class="pa-4"
                >
                  <h3 class="text-h6 mb-4">
                    网站配置
                  </h3>

                  <v-text-field
                    v-model="forms.site.data.siteName"
                    label="网站名称"
                    :rules="[rules.required, rules.maxLength(100)]"
                    variant="outlined"
                    class="mb-4"
                  />

                  <v-alert
                    type="info"
                    variant="tonal"
                  >
                    网站名称将显示在浏览器标签页和页面标题中。您可以稍后在设置中修改。
                  </v-alert>
                </v-form>
              </template>

              <template #[`item.3`]>
                <v-form
                  ref="adminForm"
                  v-model="forms.admin.valid"
                  class="pa-4"
                >
                  <h3 class="text-h6 mb-4">
                    管理员账户
                  </h3>

                  <v-text-field
                    v-model="forms.admin.data.username"
                    label="用户名"
                    :rules="[rules.required, rules.minLength(3), rules.maxLength(50), rules.username]"
                    variant="outlined"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="forms.admin.data.email"
                    label="邮箱（可选）"
                    :rules="[rules.email]"
                    variant="outlined"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="forms.admin.data.password"
                    label="密码"
                    :rules="[rules.required, rules.minLength(8), rules.maxLength(100)]"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="forms.admin.data.confirmPassword"
                    label="确认密码"
                    :rules="[rules.required, rules.passwordMatch]"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                  />

                  <v-alert
                    type="warning"
                    variant="tonal"
                  >
                    请妥善保管您的管理员账户信息。管理员拥有网站的最高权限。
                  </v-alert>
                </v-form>
              </template>

              <template #[`item.4`]>
                <div class="pa-4">
                  <h3 class="text-h6 mb-4">
                    确认配置
                  </h3>

                  <v-list>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">
                          mdi-web
                        </v-icon>
                      </template>
                      <v-list-item-title>网站名称</v-list-item-title>
                      <v-list-item-subtitle>{{ forms.site.data.siteName }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">
                          mdi-account
                        </v-icon>
                      </template>
                      <v-list-item-title>管理员用户名</v-list-item-title>
                      <v-list-item-subtitle>{{ forms.admin.data.username }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item v-if="forms.admin.data.email">
                      <template #prepend>
                        <v-icon color="primary">
                          mdi-email
                        </v-icon>
                      </template>
                      <v-list-item-title>管理员邮箱</v-list-item-title>
                      <v-list-item-subtitle>{{ forms.admin.data.email }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>

                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mt-4"
                  >
                    点击"完成安装"按钮后，系统将自动创建数据库、配置文件和管理员账户。
                  </v-alert>
                </div>
              </template>

              <template #[`item.5`]>
                <div class="pa-4 text-center">
                  <v-icon
                    size="80"
                    color="success"
                    class="mb-4"
                  >
                    mdi-check-circle
                  </v-icon>
                  <h3 class="text-h5 mb-2">
                    安装完成！
                  </h3>
                  <p class="text-body-1 mb-4">
                    恭喜！您的博客系统已经成功安装。现在您可以使用刚才创建的管理员账户登录。
                  </p>

                  <v-btn
                    color="primary"
                    size="large"
                    to="/login"
                  >
                    前往登录
                  </v-btn>
                </div>
              </template>

              <template #actions>
                <div class="d-flex justify-space-between pa-4">
                  <v-btn
                    v-if="currentStep > 1 && currentStep < 5 && !setupComplete"
                    variant="text"
                    @click="prevStep"
                  >
                    上一步
                  </v-btn>
                  <div v-else />
                  <v-btn
                    v-if="currentStep < 4 && !setupComplete"
                    color="primary"
                    @click="nextStep"
                  >
                    下一步
                  </v-btn>
                  <v-btn
                    v-if="currentStep === 4 && !setupComplete"
                    color="primary"
                    :loading="loading"
                    @click="completeSetup"
                  >
                    完成安装
                  </v-btn>
                </div>
              </template>
            </v-stepper>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  ssr: false
})

const currentStep = ref(1)
const loading = ref(false)
const setupComplete = ref(false)
const errorMessage = ref('')

const steps = [
  '欢迎',
  '网站配置',
  '管理员账户',
  '确认',
  '完成'
]

const forms = reactive({
  site: {
    valid: false,
    data: {
      siteName: 'My Blog'
    }
  },
  admin: {
    valid: false,
    data: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  }
})

const siteForm = ref()
const adminForm = ref()

const rules = {
  required: (v: string) => !!v || '此字段为必填项',
  minLength: (min: number) => (v: string) =>
    (v && v.length >= min) || `至少需要 ${min} 个字符`,
  maxLength: (max: number) => (v: string) =>
    (v && v.length <= max) || `最多允许 ${max} 个字符`,
  email: (v: string) =>
    !v || /.+@.+\..+/.test(v) || '请输入有效的邮箱地址',
  username: (v: string) =>
    /^[a-zA-Z0-9_]+$/.test(v) || '用户名只能包含字母、数字和下划线',
  passwordMatch: (v: string) =>
    v === forms.admin.data.password || '两次输入的密码不一致'
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function nextStep() {
  if (currentStep.value === 2) {
    const result = await siteForm.value?.validate()
    if (!result?.valid) return
  }

  if (currentStep.value === 3) {
    const result = await adminForm.value?.validate()
    if (!result?.valid) return
  }

  if (currentStep.value < 4) {
    currentStep.value++
  }
}

async function completeSetup() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/setup/init', {
      method: 'POST',
      body: {
        siteName: forms.site.data.siteName,
        adminUsername: forms.admin.data.username,
        adminPassword: forms.admin.data.password,
        adminEmail: forms.admin.data.email || undefined
      }
    })

    if (response.success) {
      setupComplete.value = true
      currentStep.value = 5
    }
  } catch (error: any) {
    console.error('Setup failed:', error)
    errorMessage.value = error?.data?.message || '安装失败，请重试'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const status = await $fetch('/api/setup/status')

    if (!status.needsSetup) {
      navigateTo('/')
    }
  } catch {
    console.error('Failed to check setup status')
  }
})
</script>
