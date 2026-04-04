<template>
  <div class="mdui-container-fluid">
    <LayoutAppHeader />
    <ClientOnly>
      <LayoutAppDrawer />
    </ClientOnly>
    <main class="mdui-main">
      <NuxtPage />
    </main>
    <ClientOnly>
      <mdui-snackbar
        v-for="(message, index) in snackbar.messages.value"
        :key="index"
        :open="true"
        :message="message"
        :timeout="4000"
        @closed="snackbar.clear(index)"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
const drawer = ref(true)
const isExpanded = ref(false)

const snackbar = useSnackbar()

const toggleExpand = () => {
  drawer.value = !drawer.value
}

onMounted(() => {
  // 初始化逻辑
})

provide('drawer', drawer)
provide('isExpanded', isExpanded)
provide('toggleExpand', toggleExpand)
</script>

<style>
.mdui-main {
  min-height: calc(100vh - 64px);
  padding: 24px;
}
</style>
