<template>
  <ClientOnly>
    <div class="drawer-container">
      <div class="nav-rail">
        <div
          v-for="item in navItems"
          :key="item.title"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          @click="navigateTo(item.to)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path :d="item.iconPath" fill="currentColor"/>
          </svg>
          <span class="nav-text">{{ item.title }}</span>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const route = useRoute()

interface NavItem {
  title: string
  to: string
  iconPath: string
}

const navItems: NavItem[] = [
  { 
    title: '首页', 
    to: '/', 
    iconPath: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' 
  },
  { 
    title: '追番', 
    to: '/chase', 
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z' 
  },
  { 
    title: '文章', 
    to: '/article', 
    iconPath: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' 
  },
  { 
    title: 'GitHub', 
    to: '/github', 
    iconPath: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' 
  },
]

const isActive = (path: string) => route.path === path
</script>

<style scoped>
.drawer-container {
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  width: 80px;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
}

.nav-rail {
  padding: 8px 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  cursor: pointer;
  color: #666;
  transition: background-color 0.2s, color 0.2s;
}

.nav-item:hover {
  background-color: #e0e0e0;
}

.nav-item.active {
  color: #6750A4;
}

.nav-text {
  font-size: 12px;
  margin-top: 4px;
}

@media (max-width: 1024px) {
  .drawer-container {
    display: none;
  }
}
</style>
