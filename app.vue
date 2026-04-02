<template>
  <v-app>
    <LayoutAppHeader />
    <ClientOnly>
      <LayoutAppDrawer />
    </ClientOnly>
    <v-main>
      <NuxtPage />
    </v-main>
    <ClientOnly>
      <v-snackbar-queue
        :model-value="snackbar.messages.value"
        @update:model-value="snackbar.clear"
        location="bottom right"
        :timeout="4000"
      />
    </ClientOnly>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { navigateTo } from 'nuxt/app'
import { useDisplay } from 'vuetify'
import { useSnackbar } from '~/composables/useSnackbar'

const drawer = ref(true)
const isExpanded = ref(false)

const { mobile } = useDisplay()
const snackbar = useSnackbar()

const toggleExpand = () => {
  if (mobile.value) {
    drawer.value = !drawer.value
  } else {
    isExpanded.value = !isExpanded.value
  }
}

const checkOobeStatus = () => {
  if (import.meta.client) {
    const oobeCompleted = localStorage.getItem('oobeCompleted') === 'true'
    if (!oobeCompleted) {
      // 如果未完成 OOBE，跳转到 OOBE 页面
      navigateTo('/oobe')
    }
  }
}

onMounted(() => {
  drawer.value = !mobile.value
  checkOobeStatus()
})

provide('drawer', drawer)
provide('isExpanded', isExpanded)
provide('toggleExpand', toggleExpand)
</script>
