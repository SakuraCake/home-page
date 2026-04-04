<template>
  <mdui-top-app-bar>
    <mdui-button-icon slot="navigation-icon" @click="toggleExpand">
      <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
      </svg>
    </mdui-button-icon>
    <mdui-top-app-bar-title>{{ pageTitle }}</mdui-top-app-bar-title>
    <mdui-button-icon slot="action-item" @click="handleToggleTheme">
      <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path v-if="!isDark" fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2V9h2V8zm0 2h-2v4h2v-4z"/>
        <path v-else fill="currentColor" d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zM20 10.5v2h3v-2h-3zm-3.76 9.16l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41zM13 23.5h2v-2.95h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.79-1.41-1.41-1.79 1.79z"/>
      </svg>
    </mdui-button-icon>

    <ClientOnly>
      <template v-if="userStore.isLoggedIn">
        <mdui-dropdown slot="action-item">
          <mdui-button-icon slot="trigger">
            <mdui-avatar slot="icon" style="width: 32px; height: 32px;">
              <svg v-if="!userStore.user?.avatar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </mdui-avatar>
          </mdui-button-icon>
          <mdui-menu>
            <div style="padding: 16px;">
              <div style="font-weight: 500;">{{ userStore.user?.username }}</div>
              <mdui-chip size="small" :color="userStore.isAdmin ? 'primary' : 'default'" style="margin-top: 4px;">
                {{ userStore.isAdmin ? '管理员' : '用户' }}
              </mdui-chip>
            </div>
            <mdui-divider></mdui-divider>
            <mdui-menu-item @click="navigateTo('/user')">
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              用户中心
            </mdui-menu-item>
            <mdui-menu-item v-if="userStore.isAdmin" @click="navigateTo('/admin')">
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22l-1.92 3.32c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
              管理中心
            </mdui-menu-item>
            <mdui-menu-item @click="navigateTo('/article/create')">
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              写文章
            </mdui-menu-item>
            <mdui-divider></mdui-divider>
            <mdui-menu-item @click="handleLogout">
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              </svg>
              退出登录
            </mdui-menu-item>
          </mdui-menu>
        </mdui-dropdown>
      </template>

      <template v-else>
        <mdui-button-icon slot="action-item" @click="navigateTo('/login')">
          <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </mdui-button-icon>
      </template>
    </ClientOnly>
  </mdui-top-app-bar>
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
    '/github': 'GitHub 项目',
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

<style scoped>
svg {
  fill: currentColor;
}
</style>
