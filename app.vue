<template>
  <v-app>
    <LayoutAppHeader :toggle-drawer="toggleDrawer" />
    <ClientOnly>
      <LayoutAppDrawer />
    </ClientOnly>
    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const drawer = ref(true)

const toggleDrawer = () => {
  drawer.value = !drawer.value
}

onMounted(() => {
  drawer.value = !mobile.value
})

provide('drawer', drawer)
provide('toggleDrawer', toggleDrawer)
</script>
