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
      <Oobe v-if="!oobeCompleted" />
    </ClientOnly>
  </v-app>
</template>

<script setup lang="ts">
import Oobe from './components/Oobe.vue'

const drawer = ref(true)
const isExpanded = ref(false)

const { mobile } = useDisplay()
const snackbar = useSnackbar()

const oobeCompleted = ref(false)

const checkOobeStatus = () => {
  if (import.meta.client) {
    oobeCompleted.value = localStorage.getItem('oobeCompleted') === 'true'
  }
}

const toggleExpand = () => {
  if (mobile.value) {
    drawer.value = !drawer.value
  } else {
    isExpanded.value = !isExpanded.value
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
