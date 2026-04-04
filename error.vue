<template>
  <div class="mdui-container-fluid">
    <LayoutAppHeader />
    <ClientOnly>
      <LayoutAppDrawer />
    </ClientOnly>
    <main class="mdui-main">
      <div class="mdui-container" style="min-height: 70vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div class="text-center">
          <mdui-icon size="120" color="error" class="mb-6">error_outline</mdui-icon>
          
          <h1 class="mdui-typo-headline-3 mb-4">
            {{ errorTitle }}
          </h1>
          
          <p class="mdui-typo-body-1 mdui-text-color-text-secondary mb-8">
            {{ errorMessage }}
          </p>
          
          <div class="mdui-flex mdui-justify-center gap-4">
            <mdui-button
              variant="flat"
              color="primary"
              href="/"
            >
              <mdui-icon start>home</mdui-icon>
              返回首页
            </mdui-button>
            
            <mdui-button
              variant="outlined"
              @click="handleClearError"
            >
              <mdui-icon start>refresh</mdui-icon>
              重试
            </mdui-button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const drawer = ref(true)
const isExpanded = ref(false)

const toggleExpand = () => {
  drawer.value = !drawer.value
}

onMounted(() => {
  // 初始化逻辑
})

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
