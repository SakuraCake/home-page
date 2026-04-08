declare global {
  interface Window {
    initGeetest: (config: {
      gt: string
      challenge: string
      offline: boolean
      new_captcha: boolean
      product?: string
    }, callback: (captchaObj: GeetestCaptcha) => void) => void
  }
}

interface GeetestCaptcha {
  onReady: (callback: () => void) => void
  onSuccess: (callback: () => void) => void
  onError: (callback: () => void) => void
  onClose: (callback: () => void) => void
  getValidate: () => {
    geetest_challenge: string
    geetest_validate: string
    geetest_seccode: string
  } | null
  reset: () => void
  verify: () => void
}

interface GeetestResult {
  geetest_challenge: string
  geetest_validate: string
  geetest_seccode: string
}

const GEETEST_SCRIPT_URL = 'https://static.geetest.com/static/js/gt.0.5.0.js'
let scriptLoaded = false
let scriptLoading = false

function loadGeetestScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (scriptLoaded && typeof window.initGeetest === 'function') {
      resolve(true)
      return
    }

    if (scriptLoading) {
      const checkInterval = setInterval(() => {
        if (typeof window.initGeetest === 'function') {
          clearInterval(checkInterval)
          resolve(true)
        }
      }, 100)
      return
    }

    scriptLoading = true
    const script = document.createElement('script')
    script.src = GEETEST_SCRIPT_URL
    script.async = true

    script.onload = () => {
      scriptLoaded = true
      scriptLoading = false
      resolve(true)
    }

    script.onerror = () => {
      scriptLoading = false
      resolve(false)
    }

    document.head.appendChild(script)
  })
}

export const useGeetest = () => {
  const isReady = ref(false)
  const isVerified = ref(false)
  const captchaObj = shallowRef<GeetestCaptcha | null>(null)
  const validateResult = ref<GeetestResult | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const init = async () => {
    if (captchaObj.value) {
      return true
    }

    isLoading.value = true
    error.value = null

    const scriptLoaded = await loadGeetestScript()
    if (!scriptLoaded || !window.initGeetest) {
      error.value = '极验 SDK 加载失败'
      isLoading.value = false
      return false
    }

    try {
      const response = await $fetch<{
        success: number
        gt: string
        challenge: string
        new_captcha: boolean
      }>('/api/captcha/register')

      return new Promise<boolean>((resolve) => {
        window.initGeetest({
          gt: response.gt,
          challenge: response.challenge,
          offline: response.success === 0,
          new_captcha: response.new_captcha,
          product: 'bind',
        }, (obj) => {
          captchaObj.value = obj

          obj.onReady(() => {
            isReady.value = true
          })

          obj.onSuccess(() => {
            const result = obj.getValidate()
            if (result) {
              validateResult.value = result
              isVerified.value = true
            }
          })

          obj.onError(() => {
            isVerified.value = false
            validateResult.value = null
            error.value = '验证出错'
          })

          obj.onClose(() => { })

          isLoading.value = false
          resolve(true)
        })
      })
    } catch (_err) {
      error.value = '极验初始化失败'
      isLoading.value = false
      return false
    }
  }

  const verify = () => {
    if (captchaObj.value) {
      captchaObj.value.verify()
    }
  }

  const reset = () => {
    if (captchaObj.value) {
      captchaObj.value.reset()
      isVerified.value = false
      validateResult.value = null
    }
  }

  return {
    isReady,
    isVerified,
    validateResult,
    error,
    isLoading,
    init,
    verify,
    reset,
  }
}
