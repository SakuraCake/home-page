<template>
  <div id="app">
    <LayoutAppHeader />
    <ClientOnly>
      <LayoutAppDrawer />
    </ClientOnly>
    <main class="main-content">
      <NuxtPage />
    </main>
    <ClientOnly>
      <div id="snackbar-container"></div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const drawer = ref(true)
const isExpanded = ref(false)

const snackbar = useSnackbar()

const toggleExpand = () => {
  drawer.value = !drawer.value
}

provide('drawer', drawer)
provide('isExpanded', isExpanded)
provide('toggleExpand', toggleExpand)
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
