import { computed } from 'vue'
import { getTheme, setTheme } from 'mdui'

export const useAppTheme = () => {
  const isDark = computed(() => {
    if (import.meta.client) {
      return getTheme() === 'dark'
    }
    return false
  })

  const toggleTheme = () => {
    if (import.meta.client) {
      const newTheme = isDark.value ? 'light' : 'dark'
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
    }
  }

  const initTheme = () => {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
  }

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
