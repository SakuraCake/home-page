<template>
  <ClientOnly>
    <v-navigation-drawer
      v-model="drawer"
      :rail="!isMobile && !isExpanded"
      :temporary="isMobile"
      :expand-on-hover="!isMobile && !isExpanded"
      disable-route-watcher
      @mouseenter="handleDrawerMouseEnter"
      @mouseleave="handleDrawerMouseLeave"
    >
      <v-list v-model:opened="openedGroups" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.title"
        />

        <v-list-group value="user">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-account"
              title="用户中心"
              :active="isUserMenuActive"
              color="primary"
            />
          </template>

          <v-list-item
            v-for="item in userMenuItems"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :value="item.title"
          />
        </v-list-group>

        <v-list-group v-if="userStore.isAdmin" value="admin">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-shield-account"
              title="管理中心"
              :active="isAdminMenuActive"
              color="primary"
            />
          </template>

          <v-list-item
            v-for="item in adminMenuItems"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :value="item.title"
          />
        </v-list-group>
      </v-list>

      <template #append>
        <v-divider />
        <v-list nav class="pa-2">
          <v-menu v-if="userStore.isLoggedIn" offset="8">
            <template #activator="{ props: menuProps }">
              <v-list-item
                v-bind="menuProps"
                :prepend-avatar="userStore.user?.avatar || undefined"
                :prepend-icon="!userStore.user?.avatar ? 'mdi-account' : undefined"
                :title="userStore.user?.username"
                :subtitle="userStore.user?.role === 'admin' ? '管理员' : '用户'"
              />
            </template>

            <v-list density="compact" nav>
              <v-list-item to="/user" prepend-icon="mdi-account-circle" title="个人资料" />
              <v-list-item to="/user/articles" prepend-icon="mdi-file-document-outline" title="我的文章" />
              <v-list-item to="/user/comments" prepend-icon="mdi-comment-outline" title="我的评论" />
              <v-divider />
              <v-list-item prepend-icon="mdi-logout" title="退出登录" @click="handleLogout" />
            </v-list>
          </v-menu>

          <v-list-item v-else to="/login" prepend-icon="mdi-account" title="点击登录" />
        </v-list>
      </template>
    </v-navigation-drawer>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const drawer = inject<Ref<boolean>>('drawer', ref(false))
const isExpanded = inject<Ref<boolean>>('isExpanded', ref(false))
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)
const isRail = computed(() => !isMobile.value && !isExpanded.value)
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const openedGroups = ref<string[]>([])
const savedOpenedGroups = ref<string[]>([])

const isUserMenuActive = computed(() => {
  return route.path.startsWith('/user')
})

const isAdminMenuActive = computed(() => {
  return route.path.startsWith('/admin')
})

watch(isRail, (rail) => {
  if (rail) {
    openedGroups.value = []
  }
}, { immediate: true })

const handleDrawerMouseEnter = () => {
  if (isRail.value && savedOpenedGroups.value.length > 0) {
    openedGroups.value = [...savedOpenedGroups.value]
  }
}

const handleDrawerMouseLeave = () => {
  if (isRail.value) {
    savedOpenedGroups.value = [...openedGroups.value]
    openedGroups.value = []
  }
}

interface NavItem {
  title: string
  to: string
  icon: string
}

const navItems: NavItem[] = [
  { title: '首页', to: '/', icon: 'mdi-home' },
  { title: '追番', to: '/chase', icon: 'mdi-animation' },
  { title: '文章', to: '/article', icon: 'mdi-file-document' },
]

const userMenuItems: NavItem[] = [
  { title: '个人资料', to: '/user', icon: 'mdi-account-circle' },
  { title: '我的文章', to: '/user/articles', icon: 'mdi-file-document-outline' },
  { title: '我的评论', to: '/user/comments', icon: 'mdi-comment-outline' },
]

const adminMenuItems: NavItem[] = [
  { title: '概览', to: '/admin', icon: 'mdi-view-dashboard' },
  { title: '文章管理', to: '/admin/articles', icon: 'mdi-file-document-multiple' },
  { title: '分类管理', to: '/admin/categories', icon: 'mdi-folder-multiple' },
  { title: '标签管理', to: '/admin/tags', icon: 'mdi-tag-multiple' },
  { title: '评论管理', to: '/admin/comments', icon: 'mdi-comment-multiple' },
  { title: '用户管理', to: '/admin/users', icon: 'mdi-account-group' },
  { title: '验证码设置', to: '/admin/captcha', icon: 'mdi-shield-check' },
  { title: '系统设置', to: '/admin/settings', icon: 'mdi-cog' },
]

const handleLogout = async () => {
  await userStore.logout()
  router.push('/')
}
</script>
