import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  email: string | null
  role: string
  avatar: string | null
  createdAt: number
  updatedAt: number
}

interface UserState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user && !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    setToken(token: string) {
      this.token = token
      const cookie = useCookie('auth_token', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      cookie.value = token
    },

    getToken(): string | null {
      if (this.token) return this.token
      const cookie = useCookie('auth_token')
      return cookie.value || null
    },

    clearToken() {
      this.token = null
      const cookie = useCookie('auth_token')
      cookie.value = null
    },

    async login(username: string, password: string) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { username, password },
        })

        if (response.success && response.data) {
          this.user = response.data.user
          this.setToken(response.data.token)
          return true
        } else {
          this.error = response.message || '登录失败'
          return false
        }
      } catch (e) {
        this.error = e instanceof Error ? e.message : '登录失败'
        return false
      } finally {
        this.loading = false
      }
    },

    async register(username: string, password: string, email?: string) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: { username, password, email },
        })

        if (response.success && response.data) {
          this.user = response.data.user
          this.setToken(response.data.token)
          return true
        } else {
          this.error = response.message || '注册失败'
          return false
        }
      } catch (e) {
        this.error = e instanceof Error ? e.message : '注册失败'
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST',
          headers: this.getAuthHeaders(),
        })
      } catch (e) {
        // ignore
      }

      this.user = null
      this.clearToken()
    },

    async fetchUser() {
      const token = this.getToken()
      if (!token) return false

      this.loading = true
      this.error = null

      try {
        const response = await $fetch('/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.success && response.data) {
          this.user = response.data
          this.token = token
          return true
        } else {
          this.clearToken()
          return false
        }
      } catch (e) {
        this.clearToken()
        return false
      } finally {
        this.loading = false
      }
    },

    getAuthHeaders(): Record<string, string> {
      const token = this.getToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
  },
})
