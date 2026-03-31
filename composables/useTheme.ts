export const useAppTheme = () => {
  const theme = useTheme()

  const isDark = computed(() => theme.global.current.value.dark)

  const toggleTheme = () => {
    theme.global.name.value = isDark.value ? 'light' : 'dark'
    if (import.meta.client) {
      localStorage.setItem('theme', theme.global.name.value)
    }
  }

  const initTheme = () => {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        theme.global.name.value = savedTheme
      }
    }
  }

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
