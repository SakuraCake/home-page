<template>
  <div id="app">
    <LayoutAppHeader />
    <ClientOnly>
      <LayoutAppDrawer />
    </ClientOnly>
    <main class="main-content">
      <div style="display: flex; justify-content: center; align-items: center; min-height: 60vh;">
        <mdui-card style="max-width: 500px; width: 100%;">
          <div style="padding: 32px; text-align: center;">
            <mdui-icon name="error" style="font-size: 80px; color: #B3261E; margin-bottom: 24px;"></mdui-icon>
            
            <h1 style="margin: 0 0 16px 0; font-size: 24px;">
              {{ errorTitle }}
            </h1>
            
            <p style="margin: 0 0 32px 0; color: #666;">
              {{ errorMessage }}
            </p>
            
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <mdui-button href="/">
                返回首页
              </mdui-button>
              <mdui-button variant="outlined" @click="handleClearError">
                重试
              </mdui-button>
            </div>
          </div>
        </mdui-card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const drawer = ref(true)
const isExpanded = ref(false)

const toggleExpand = () => {
  drawer.value = !drawer.value
}

provide('drawer', drawer)
provide('isExpanded', isExpanded)
provide('toggleExpand', toggleExpand)

const errorTitle = computed(() => {
  if (props.error.statusCode === 404) {
    return '页面未找到'
  }
  if (props.error.statusCode === 500) {
    return '服务器错误'
  }
  return `错误 ${props.error.statusCode}`
})

const errorMessage = computed(() => {
  if (props.error.statusCode === 404) {
    return '抱歉，您访问的页面不存在或已被移除。'
  }
  if (props.error.statusCode === 500) {
    return '服务器内部错误，请稍后再试。'
  }
  return props.error.message || '发生了一个未知错误。'
})

const handleClearError = () => {
  clearError({ redirect: '/' })
}

useHead({
  title: errorTitle.value
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: 'Roboto', sans-serif;
}

.main-content {
  margin-left: 0;
  padding: 16px;
  min-height: calc(100vh - 64px);
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: 80px;
  }
}
</style>
