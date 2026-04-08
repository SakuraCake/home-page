import { defineStore } from 'pinia'
import type { SiteConfig, ApiResponse } from '#shared/types/api'

export const useSiteConfigStore = defineStore('siteConfig', () => {
  const config = ref<SiteConfig | null>(null)
  const loading = ref(false)
  const loaded = ref(false)

  const siteName = computed(() => config.value?.siteName || 'My Blog')

  async function loadConfig() {
    if (loaded.value) return

    loading.value = true
    try {
      const response = await $fetch<ApiResponse<SiteConfig>>('/api/config/site')
      if (response.success && response.data) {
        config.value = response.data
      }
    } catch {
      console.error('Failed to load site config')
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  function updateConfig(newConfig: Partial<SiteConfig>) {
    if (config.value) {
      config.value = { ...config.value, ...newConfig }
    }
  }

  return {
    config,
    loading,
    loaded,
    siteName,
    loadConfig,
    updateConfig,
  }
})
