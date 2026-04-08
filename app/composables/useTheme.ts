export const useAppTheme = () => {
  const theme = useTheme()

  const isDark = computed(() => {
    if (import.meta.client) {
      return theme.global.current.value.dark
    }
    return false
  })

  const toggleTheme = () => {
    if (import.meta.client) {
      theme.global.name.value = isDark.value ? 'light' : 'dark'
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
