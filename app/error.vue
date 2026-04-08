<template>
  <v-app>
    <LayoutAppHeader />
    <ClientOnly>
      <LayoutAppDrawer />
    </ClientOnly>
    <v-main>
      <v-container class="fill-height">
        <v-row
          justify="center"
          align="center"
        >
          <v-col
            cols="12"
            sm="8"
            md="6"
            class="text-center"
          >
            <v-icon
              size="120"
              color="error"
              class="mb-6"
            >
              mdi-alert-circle-outline
            </v-icon>

            <h1 class="text-h3 font-weight-bold mb-4">
              {{ errorTitle }}
            </h1>

            <p class="text-body-1 text-medium-emphasis mb-8">
              {{ errorMessage }}
            </p>

            <div class="d-flex justify-center ga-4">
              <v-btn
                color="primary"
                variant="flat"
                to="/"
              >
                <v-icon start>
                  mdi-home
                </v-icon>
                返回首页
              </v-btn>

              <v-btn
                variant="tonal"
                @click="handleClearError"
              >
                <v-icon start>
                  mdi-refresh
                </v-icon>
                重试
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { mobile } = useDisplay()
const drawer = ref(true)
const isExpanded = ref(false)

const toggleExpand = () => {
  if (mobile.value) {
    drawer.value = !drawer.value
  } else {
    isExpanded.value = !isExpanded.value
  }
}

onMounted(() => {
  drawer.value = !mobile.value
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
