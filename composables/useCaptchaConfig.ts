interface CaptchaConfig {
  enabled: boolean
  provider: string
  siteKey: string
  loginEnabled: boolean
  registerEnabled: boolean
  commentEnabled: boolean
}

const config = ref<CaptchaConfig | null>(null)
const loading = ref(false)
const loaded = ref(false)

export const useCaptchaConfig = () => {
  const fetchConfig = async () => {
    if (loaded.value) return config.value
    
    loading.value = true
    try {
      const response = await $fetch('/api/captcha/config')
      if (response.success && response.data) {
        config.value = response.data
        loaded.value = true
      }
    } catch (e) {
      console.error('获取验证码配置失败', e)
    } finally {
      loading.value = false
    }
    return config.value
  }

  const isEnabled = (scene: 'login' | 'register' | 'comment') => {
    if (!config.value) return true
    if (!config.value.enabled) return false
    switch (scene) {
      case 'login':
        return config.value.loginEnabled
      case 'register':
        return config.value.registerEnabled
      case 'comment':
        return config.value.commentEnabled
      default:
        return false
    }
  }

  return {
    config,
    loading,
    loaded,
    fetchConfig,
    isEnabled,
  }
}
