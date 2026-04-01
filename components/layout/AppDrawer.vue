<template>
  <ClientOnly>
    <v-navigation-drawer 
      v-model="drawer" 
      :rail="!isMobile && !isExpanded"
      :temporary="isMobile"
      disable-route-watcher
    >
      <v-list nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.title"
        />
      </v-list>
    </v-navigation-drawer>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const drawer = inject<Ref<boolean>>('drawer', ref(false))
const isExpanded = inject<Ref<boolean>>('isExpanded', ref(false))
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

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
</script>
