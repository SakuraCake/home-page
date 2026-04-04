export const useAppTheme = () => {
  const isDark = ref(false)

  const toggleTheme = () => {
    if (import.meta.client) {
      isDark.value = !isDark.value
      document.documentElement.classList.toggle('dark', isDark.value)
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }

  const initTheme = () => {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        isDark.value = savedTheme === 'dark'
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDark.value = true
      }
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  }

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
