<template>
  <v-app-bar>
    <v-app-bar-nav-icon @click="toggleExpand" />
    <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
    <v-spacer />
    <v-btn icon @click="handleToggleTheme">
      <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const _isExpanded = inject<Ref<boolean>>('isExpanded', ref(false))
const toggleExpand = inject<() => void>('toggleExpand', () => { })
const userStore = useUserStore()

const { isDark, toggleTheme, initTheme } = useAppTheme()
const route = useRoute()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': '首页',
    '/chase': '追番列表',
    '/article': '文章',
    '/login': '登录',
    '/register': '注册',
    '/article/create': '写文章',
    '/user': '用户中心',
    '/user/articles': '我的文章',
    '/user/comments': '我的评论',
    '/admin': '管理中心',
    '/admin/users': '用户管理',
    '/admin/articles': '文章管理',
    '/admin/categories': '分类管理',
    '/admin/tags': '标签管理',
    '/admin/captcha': '验证码配置',
    '/admin/settings': '系统设置',
    '/admin/comments': '评论管理',
  }

  if (route.path.match(/^\/article\/\d+(\/edit)?$/)) {
    return route.path.includes('/edit') ? '编辑文章' : '文章详情'
  }

  return titles[route.path] || 'Sorange Home'
})

const handleToggleTheme = () => {
  toggleTheme()
}

onMounted(async () => {
  initTheme()
  await userStore.fetchUser()
})
</script>
