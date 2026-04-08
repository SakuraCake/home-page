export default defineNuxtPlugin(async (_nuxtApp) => {
  const userStore = useUserStore()

  if (process.dev) {
    console.log('[auth plugin] starting auth check...')
  }

  try {
    const response = await $fetch('/api/user/me')

    if (process.dev) {
      console.log('[auth plugin] API response:', response)
    }

    if (response.success && response.data) {
      userStore.user = response.data

      if (process.dev) {
        console.log('[auth plugin] user restored:', response.data.username)
      }
    }
  } catch (e) {
    if (process.dev) {
      console.log('[auth plugin] error:', e)
    }
  }
})
