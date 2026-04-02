interface SiteConfig {
  siteName: string
  siteDescription: string
  siteKeywords: string
  siteUrl: string
  logo: string
  favicon: string
  footerText: string
  icp: string
  analyticsCode: string
  postsPerPage: number
  allowRegister: boolean
  allowComment: boolean
  commentNeedReview: boolean
}

interface CaptchaConfig {
  enabled: boolean
  provider: string
  siteKey: string
  loginEnabled: boolean
  registerEnabled: boolean
  commentEnabled: boolean
}

interface AppConfig {
  site: SiteConfig
  captcha: CaptchaConfig
}

const config = ref<AppConfig | null>(null)
const loading = ref(false)
const loaded = ref(false)

export const useSiteConfig = () => {
  const fetchConfig = async (force = false) => {
    if (loaded.value && !force) return config.value
    
    loading.value = true
    try {
      const response = await $fetch('/api/config') as { success: boolean; data: AppConfig }
      if (response.success && response.data) {
        config.value = response.data
        loaded.value = true
      }
    } catch (e) {
      console.error('获取系统配置失败', e)
    } finally {
      loading.value = false
    }
    return config.value
  }

  const siteName = computed(() => config.value?.site?.siteName ?? 'My Blog')
  const siteDescription = computed(() => config.value?.site?.siteDescription ?? '')
  const postsPerPage = computed(() => config.value?.site?.postsPerPage ?? 10)
  const allowRegister = computed(() => config.value?.site?.allowRegister ?? true)
  const allowComment = computed(() => config.value?.site?.allowComment ?? true)
  const commentNeedReview = computed(() => config.value?.site?.commentNeedReview ?? false)
  
  const captchaEnabled = computed(() => config.value?.captcha?.enabled ?? true)
  const captchaSiteKey = computed(() => config.value?.captcha?.siteKey ?? '')
  const captchaLoginEnabled = computed(() => config.value?.captcha?.loginEnabled ?? true)
  const captchaRegisterEnabled = computed(() => config.value?.captcha?.registerEnabled ?? true)
  const captchaCommentEnabled = computed(() => config.value?.captcha?.commentEnabled ?? true)

  return {
    config,
    loading,
    loaded,
    fetchConfig,
    siteName,
    siteDescription,
    postsPerPage,
    allowRegister,
    allowComment,
    commentNeedReview,
    captchaEnabled,
    captchaSiteKey,
    captchaLoginEnabled,
    captchaRegisterEnabled,
    captchaCommentEnabled,
  }
}
