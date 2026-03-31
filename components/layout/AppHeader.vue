<template>
  <v-app-bar>
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
    <v-spacer />
    <v-btn icon @click="handleToggleTheme">
      <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
const drawer = inject<boolean>('drawer')
const toggleDrawer = inject<() => void>('toggleDrawer')!

const { isDark, toggleTheme, initTheme } = useAppTheme()
const route = useRoute()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': '首页',
    '/chase': '追番列表',
    '/article': '文章'
  }
  
  if (route.path.startsWith('/article/')) {
    return '文章详情'
  }
  
  return titles[route.path] || 'Sorange Home'
})

const handleToggleTheme = () => {
  toggleTheme()
}

onMounted(() => {
  initTheme()
})

defineProps<{
  toggleDrawer: () => void
}>()
</script>
