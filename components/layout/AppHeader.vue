<template>
  <mdui-top-app-bar>
    <template #start>
      <mdui-button-icon @click="toggleExpand">
        <mdui-icon>menu</mdui-icon>
      </mdui-button-icon>
      <div class="mdui-top-app-bar__title">{{ pageTitle }}</div>
    </template>
    <template #end>
      <mdui-button-icon @click="handleToggleTheme">
        <mdui-icon>{{ isDark ? 'wb_sunny' : 'nights_stay' }}</mdui-icon>
      </mdui-button-icon>

      <ClientOnly>
        <template v-if="userStore.isLoggedIn">
          <mdui-menu>
            <template #activator>
              <mdui-button-icon>
                <mdui-avatar size="32">
                  <mdui-icon v-if="!userStore.user?.avatar">person</mdui-icon>
                  <img v-else :src="userStore.user.avatar" alt="Avatar" />
                </mdui-avatar>
              </mdui-button-icon>
            </template>
            <mdui-list>
              <mdui-list-item>
                <div class="mdui-list-item__title">{{ userStore.user?.username }}</div>
                <div class="mdui-list-item__subtitle">
                  <mdui-chip size="small" :variant="userStore.isAdmin ? 'filled' : 'outlined'">
                    {{ userStore.isAdmin ? '管理员' : '用户' }}
                  </mdui-chip>
                </div>
              </mdui-list-item>
              <mdui-divider />
              <mdui-list-item href="/user">
                <template #start>
                  <mdui-icon>person</mdui-icon>
                </template>
                <div class="mdui-list-item__title">用户中心</div>
              </mdui-list-item>
              <mdui-list-item v-if="userStore.isAdmin" href="/admin">
                <template #start>
                  <mdui-icon>settings</mdui-icon>
                </template>
                <div class="mdui-list-item__title">管理中心</div>
              </mdui-list-item>
              <mdui-list-item href="/article/create">
                <template #start>
                  <mdui-icon>add</mdui-icon>
                </template>
                <div class="mdui-list-item__title">写文章</div>
              </mdui-list-item>
              <mdui-divider />
              <mdui-list-item @click="handleLogout">
                <template #start>
                  <mdui-icon>logout</mdui-icon>
                </template>
                <div class="mdui-list-item__title">退出登录</div>
              </mdui-list-item>
            </mdui-list>
          </mdui-menu>
        </template>

        <template v-else>
          <mdui-button-icon href="/login">
            <mdui-icon>person</mdui-icon>
          </mdui-button-icon>
        </template>
      </ClientOnly>
    </template>
  </mdui-top-app-bar>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { useAppTheme } from '~/composables/useTheme'

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

  return titles[route.path] || 'SakuraCake'
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
