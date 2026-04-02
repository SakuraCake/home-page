<template>
  <v-app-bar>
    <v-app-bar-nav-icon @click="toggleExpand" />
    <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
    <v-spacer />
    <v-btn icon @click="handleToggleTheme">
      <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>

    <ClientOnly>
      <template v-if="userStore.isLoggedIn">
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar size="32">
                <v-icon v-if="!userStore.user?.avatar">mdi-account</v-icon>
                <v-img v-else :src="userStore.user.avatar" />
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title>{{ userStore.user?.username }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip size="x-small" :color="userStore.isAdmin ? 'primary' : 'default'">
                  {{ userStore.isAdmin ? '管理员' : '用户' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-divider />
            <v-list-item to="/user">
              <template #prepend>
                <v-icon>mdi-account-circle</v-icon>
              </template>
              <v-list-item-title>用户中心</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="userStore.isAdmin" to="/admin">
              <template #prepend>
                <v-icon>mdi-cog</v-icon>
              </template>
              <v-list-item-title>管理中心</v-list-item-title>
            </v-list-item>
            <v-list-item to="/article/create">
              <template #prepend>
                <v-icon>mdi-plus</v-icon>
              </template>
              <v-list-item-title>写文章</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="handleLogout">
              <template #prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
              <v-list-item-title>退出登录</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-else>
        <v-btn icon to="/login">
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>
    </ClientOnly>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const isExpanded = inject<Ref<boolean>>('isExpanded', ref(false))
const toggleExpand = inject<() => void>('toggleExpand', () => {})
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

const handleLogout = async () => {
  await userStore.logout()
}

onMounted(async () => {
  initTheme()
  await userStore.fetchUser()
})
</script>
