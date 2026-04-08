import { defineStore } from 'pinia'
import type { User, ApiResponse } from '#shared/types/api'

interface UserState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

interface CaptchaData {
  geetest_challenge: string
  geetest_validate: string
  geetest_seccode: string
}

interface LoginResponse {
  token: string
  csrfToken?: string
  user: User
}

interface RegisterResponse {
  token: string
  user: User
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    setToken(token: string) {
      this.token = token
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

    async login(username: string, password: string, captcha: CaptchaData, rememberMe: boolean = false) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<ApiResponse<LoginResponse>>('/api/auth/login', {
          method: 'POST',
          body: {
            username,
            password,
            rememberMe,
            geetest_challenge: captcha.geetest_challenge,
            geetest_validate: captcha.geetest_validate,
            geetest_seccode: captcha.geetest_seccode,
          },
        })

        if (response.success && response.data) {
          this.user = response.data.user
          this.token = response.data.token
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

    async register(username: string, password: string, captcha: CaptchaData, email?: string) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<ApiResponse<RegisterResponse>>('/api/auth/register', {
          method: 'POST',
          body: {
            username,
            password,
            email,
            geetest_challenge: captcha.geetest_challenge,
            geetest_validate: captcha.geetest_validate,
            geetest_seccode: captcha.geetest_seccode,
          },
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
        await $fetch<ApiResponse>('/api/auth/logout', {
          method: 'POST',
          headers: this.getAuthHeaders(),
        })
      } catch (_e) {
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
        const response = await $fetch<ApiResponse<User>>('/api/user/me', {
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
      } catch (e: any) {
        if (e?.response?.status === 401) {
          this.clearToken()
        }
        return false
      } finally {
        this.loading = false
      }
    },

    getAuthHeaders(): Record<string, string> {
      const token = this.getToken()
      const headers: Record<string, string> = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const csrfCookie = useCookie('csrf_token')
      if (csrfCookie.value) {
        headers['X-CSRF-Token'] = csrfCookie.value
      }

      return headers
    },
  },
})
