<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="600"
    scrollable
    hide-overlay
    :persistent="true"
  >
    <v-card>
      <v-card-title class="text-center text-h4">
        欢迎使用 SakuraCake
      </v-card-title>
      
      <v-card-text>
        <v-stepper v-model="step" show-arrows>
          <!-- 欢迎步骤 -->
          <v-stepper-item :step="1" :complete="step > 1" :active="step === 1">
            <template #title>欢迎</template>
            <template #step>1</template>
            
            <v-stepper-content>
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
                  @click="nextStep"
                >
                  开始设置
                </v-btn>
              </div>
            </v-stepper-content>
          </v-stepper-item>
          
          <!-- 站点设置步骤 -->
          <v-stepper-item :step="2" :complete="step > 2" :active="step === 2">
            <template #title>站点设置</template>
            <template #step>2</template>
            
            <v-stepper-content>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">基本设置</h3>
                    
                    <v-form @submit.prevent="nextStep">
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
                  @click="prevStep"
                >
                  上一步
                </v-btn>
                <v-btn
                  color="primary"
                  @click="nextStep"
                >
                  下一步
                </v-btn>
              </div>
            </v-stepper-content>
          </v-stepper-item>
          
          <!-- Bangumi 设置步骤 -->
          <v-stepper-item :step="3" :complete="step > 3" :active="step === 3">
            <template #title>Bangumi 设置</template>
            <template #step>3</template>
            
            <v-stepper-content>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">追番功能设置</h3>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                      Bangumi 是一个动漫数据库网站，通过配置 Bangumi 用户名，您可以在 SakuraCake 中查看和管理您的追番记录。
                    </p>
                    
                    <v-form @submit.prevent="nextStep">
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
                  @click="prevStep"
                >
                  上一步
                </v-btn>
                <v-btn
                  color="primary"
                  @click="nextStep"
                >
                  下一步
                </v-btn>
              </div>
            </v-stepper-content>
          </v-stepper-item>
          
          <!-- 管理员设置步骤 -->
          <v-stepper-item :step="4" :complete="step > 4" :active="step === 4">
            <template #title>管理员设置</template>
            <template #step>4</template>
            
            <v-stepper-content>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">创建管理员账号</h3>
                    <p class="text-body-2 text-medium-emphasis mb-4">
                      请创建一个管理员账号，用于登录管理后台。
                    </p>
                    
                    <v-form @submit.prevent="nextStep">
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
                  @click="prevStep"
                >
                  上一步
                </v-btn>
                <v-btn
                  color="primary"
                  @click="nextStep"
                >
                  下一步
                </v-btn>
              </div>
            </v-stepper-content>
          </v-stepper-item>
          
          <!-- 完成步骤 -->
          <v-stepper-item :step="5" :complete="step > 5" :active="step === 5">
            <template #title>完成</template>
            <template #step>5</template>
            
            <v-stepper-content>
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
            </v-stepper-content>
          </v-stepper-item>
        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialogVisible = ref(true)
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

const nextStep = () => {
  if (step.value < 5) {
    step.value++
  }
}

const prevStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

const completeOobe = async () => {
  try {
    // 保存配置
    if (adminConfig.value.username && adminConfig.value.email && adminConfig.value.password) {
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
        dialogVisible.value = false
        
        // 跳转到登录页面
        navigateTo('/login')
      }
    }
  } catch (error) {
    console.error('OOBE 完成失败:', error)
  }
}
</script>

<style scoped>
.v-stepper {
  min-height: 400px;
}
</style>
