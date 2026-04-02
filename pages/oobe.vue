<template>
  <v-container>
    <v-row class="min-vh-100 justify-center align-center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="elevation-8">
          <v-card-title class="text-center text-h4">
            欢迎使用 SakuraCake
          </v-card-title>
          
          <v-card-text>
            <!-- 欢迎步骤 -->
            <div v-if="step === 1">
              <v-container>
                <v-row>
                  <v-col cols="12" class="text-center">
                    <v-img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=An%20elegant%20cherry%20blossom%20cake%20with%20pink%20frosting%20and%20cherry%20blossom%20petals,%20minimalist%20design,%20soft%20lighting&image_size=square"
                      alt="SakuraCake"
                      max-height="200"
                      contain
                      class="mb-4"
                    />
                    <h2 class="text-h5 mb-4">欢迎使用 SakuraCake</h2>
                    <p class="text-body-1 mb-6">
                      SakuraCake 是一个基于 Nuxt 3 的个人博客和追番管理系统，支持文章管理、评论、用户认证、追番记录等功能。
                    </p>
                    <p class="text-body-2 text-medium-emphasis mb-6">
                      请完成以下设置步骤，开始使用 SakuraCake。
                    </p>
                  </v-col>
                </v-row>
              </v-container>
              
              <div class="d-flex justify-end mt-6">
                <v-btn
                  color="primary"
                  @click="step = 2"
                >
                  开始设置
                </v-btn>
              </div>
            </div>
            
            <!-- 站点设置步骤 -->
            <div v-else-if="step === 2">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">基本设置</h3>
                    
                    <v-form>
                      <v-text-field
                        v-model="siteConfig.siteName"
                        label="站点名称"
                        required
                        class="mb-4"
                      />
                      
                      <v-text-field
                        v-model="siteConfig.siteDescription"
                        label="站点描述"
                        multiline
                        class="mb-4"
                      />
                      
                      <v-text-field
                        v-model="siteConfig.author"
                        label="作者名称"
                        class="mb-4"
                      />
                      
                      <v-text-field
                        v-model="siteConfig.email"
                        label="联系邮箱"
                        type="email"
                        class="mb-4"
                      />
                    </v-form>
                  </v-col>
                </v-row>
              </v-container>
              
              <div class="d-flex justify-between mt-6">
                <v-btn
                  @click="step = 1"
                >
                  上一步
                </v-btn>
                <v-btn
                  color="primary"
                  @click="nextStep(2)"
                >
                  下一步
                </v-btn>
              </div>
            </div>
            
            <!-- Bangumi 设置步骤 -->
            <div v-else-if="step === 3">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">追番功能设置</h3>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                      Bangumi 是一个动漫数据库网站，通过配置 Bangumi 用户名，您可以在 SakuraCake 中查看和管理您的追番记录。
                    </p>
                    
                    <v-form>
                      <v-text-field
                        v-model="bangumiConfig.username"
                        label="Bangumi 用户名"
                        class="mb-4"
                      />
                      
                      <v-checkbox
                        v-model="bangumiConfig.enabled"
                        label="启用追番功能"
                        class="mb-4"
                      />
                    </v-form>
                  </v-col>
                </v-row>
              </v-container>
              
              <div class="d-flex justify-between mt-6">
                <v-btn
                  @click="step = 2"
                >
                  上一步
                </v-btn>
                <v-btn
                  color="primary"
                  @click="nextStep(3)"
                >
                  下一步
                </v-btn>
              </div>
            </div>
            
            <!-- 管理员设置步骤 -->
            <div v-else-if="step === 4">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">创建管理员账号</h3>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                      请创建一个管理员账号，用于登录管理后台。
                    </p>
                    
                    <v-form>
                      <v-text-field
                        v-model="adminConfig.username"
                        label="用户名"
                        required
                        class="mb-4"
                      />
                      
                      <v-text-field
                        v-model="adminConfig.email"
                        label="邮箱"
                        type="email"
                        required
                        class="mb-4"
                      />
                      
                      <v-text-field
                        v-model="adminConfig.password"
                        label="密码"
                        type="password"
                        required
                        min-length="6"
                        class="mb-4"
                      />
                    </v-form>
                  </v-col>
                </v-row>
              </v-container>
              
              <div class="d-flex justify-between mt-6">
                <v-btn
                  @click="step = 3"
                >
                  上一步
                </v-btn>
                <v-btn
                  color="primary"
                  @click="nextStep(4)"
                >
                  下一步
                </v-btn>
              </div>
            </div>
            
            <!-- 完成步骤 -->
            <div v-else-if="step === 5">
              <v-container>
                <v-row>
                  <v-col cols="12" class="text-center">
                    <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
                    <h2 class="text-h5 mb-4">设置完成！</h2>
                    <p class="text-body-1 mb-6">
                      您已经成功完成了 SakuraCake 的初始设置。
                    </p>
                    <p class="text-body-2 text-medium-emphasis mb-6">
                      现在您可以：
                    </p>
                    <v-list class="text-left max-w-md mx-auto">
                      <v-list-item>
                        <template #prepend>
                          <v-icon color="success">mdi-check</v-icon>
                        </template>
                        <v-list-item-title>登录管理后台</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <template #prepend>
                          <v-icon color="success">mdi-check</v-icon>
                        </template>
                        <v-list-item-title>创建您的第一篇文章</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <template #prepend>
                          <v-icon color="success">mdi-check</v-icon>
                        </template>
                        <v-list-item-title>查看您的追番列表</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-container>
              
              <div class="d-flex justify-end mt-6">
                <v-btn
                  color="primary"
                  @click="completeOobe"
                >
                  开始使用
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { navigateTo } from 'nuxt/app'

const step = ref(1)

const siteConfig = ref({
  siteName: 'SakuraCake',
  siteDescription: '个人博客和追番管理系统',
  author: '',
  email: ''
})

const bangumiConfig = ref({
  username: '',
  enabled: true
})

const adminConfig = ref({
  username: '',
  email: '',
  password: ''
})

const nextStep = async (currentStep: number) => {
  let isValid = true
  
  // 验证当前步骤的表单
  if (currentStep === 2) {
    // 验证站点设置
    if (!siteConfig.value.siteName.trim()) {
      isValid = false
      alert('请输入站点名称')
    }
  } else if (currentStep === 4) {
    // 验证管理员设置
    if (!adminConfig.value.username.trim()) {
      isValid = false
      alert('请输入用户名')
    } else if (!adminConfig.value.email.trim()) {
      isValid = false
      alert('请输入邮箱')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminConfig.value.email)) {
      isValid = false
      alert('请输入有效的邮箱地址')
    } else if (!adminConfig.value.password || adminConfig.value.password.length < 6) {
      isValid = false
      alert('密码长度至少为6位')
    }
  }
  
  if (isValid) {
    step.value = currentStep + 1
  }
}

const completeOobe = async () => {
  try {
    // 再次验证管理员设置
    if (!adminConfig.value.username.trim()) {
      alert('请输入用户名')
      return
    } else if (!adminConfig.value.email.trim()) {
      alert('请输入邮箱')
      return
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminConfig.value.email)) {
      alert('请输入有效的邮箱地址')
      return
    } else if (!adminConfig.value.password || adminConfig.value.password.length < 6) {
      alert('密码长度至少为6位')
      return
    }
    
    // 保存配置
    // 创建管理员用户
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        username: adminConfig.value.username,
        email: adminConfig.value.email,
        password: adminConfig.value.password
      }
    })
    
    if (response.success) {
      // 设置 OOBE 完成标志
      localStorage.setItem('oobeCompleted', 'true')
      
      // 跳转到登录页面
      navigateTo('/login')
    }
  } catch (error) {
    console.error('OOBE 完成失败:', error)
    alert('创建管理员账号失败，请检查输入内容')
  }
}

onMounted(() => {
  // 检查是否已经完成 OOBE
  if (import.meta.client) {
    const oobeCompleted = localStorage.getItem('oobeCompleted') === 'true'
    if (oobeCompleted) {
      // 如果已经完成 OOBE，跳转到首页
      navigateTo('/')
    }
  }
})
</script>

<style scoped>
</style>