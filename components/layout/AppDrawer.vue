<template>
  <ClientOnly>
    <mdui-navigation-drawer v-model:open="drawer" type="modal">
      <div class="mdui-navigation-drawer__header">
        <div class="mdui-navigation-drawer__title">SakuraCake</div>
      </div>
      <mdui-list>
        <mdui-list-item
          v-for="item in navItems"
          :key="item.title"
          :href="item.to"
          @click="drawer = false"
        >
          <template #start>
            <mdui-icon>{{ item.icon }}</mdui-icon>
          </template>
          <div class="mdui-list-item__title">{{ item.title }}</div>
        </mdui-list-item>
      </mdui-list>
    </mdui-navigation-drawer>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'

const drawer = inject<Ref<boolean>>('drawer', ref(false))

interface NavItem {
  title: string
  to: string
  icon: string
}

const navItems: NavItem[] = [
  { title: '首页', to: '/', icon: 'home' },
  { title: '追番', to: '/chase', icon: 'animation' },
  { title: '文章', to: '/article', icon: 'article' },
]
</script>
