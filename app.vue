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

onMounted(() => {
  drawer.value = !mobile.value
})

provide('drawer', drawer)
provide('isExpanded', isExpanded)
provide('toggleExpand', toggleExpand)
</script>
