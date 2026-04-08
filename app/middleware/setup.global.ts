export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/setup') {
    return
  }

  if (import.meta.server) {
    return
  }

  try {
    const status = await $fetch('/api/setup/status')

    if (status.needsSetup) {
      return navigateTo('/setup')
    }
  } catch {
    console.error('Failed to check setup status')
  }
})
