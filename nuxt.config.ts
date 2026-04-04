// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    jwtSecret: '',
    geetestId: '',
    geetestKey: '',
    rateLimitMax: 100,
    rateLimitWindowMs: 900000,
    sessionMaxAge: 604800,
    public: {
      siteName: 'SakuraCake',
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('mdui-')
    }
  },
  typescript: {
    strict: true
  },
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: []
    }
  },
  routeRules: {
    '/chase': { ssr: false },
    '/admin/**': { ssr: false },
    '/article/create': { ssr: false },
    '/article/*/edit': { ssr: false },
    '/user/**': { ssr: false },
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/api/articles': { swr: 300 },
    '/api/categories': { swr: 3600 },
    '/api/tags': { swr: 3600 },
    '/api/config': { swr: 3600 },
    '/api/config/site': { swr: 3600 },
  },
  app: {
    head: {
      titleTemplate: '%s - SakuraCake',
    }
  }
})
