// https://nuxt.com/docs/api/configuration/nuxt-config
import { md3 } from 'vuetify/blueprints'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module', '@pinia/nuxt'],
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
  vuetify: {
    vuetifyOptions: {
      blueprint: md3,
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            dark: false,
            colors: {
              primary: '#6750A4',
              secondary: '#625B71',
              tertiary: '#7D5260',
              error: '#B3261E',
              info: '#191C1D',
              success: '#386A20',
              warning: '#7D5700',
              background: '#FFFBFE',
              surface: '#FFFBFE',
            },
          },
          dark: {
            dark: true,
            colors: {
              primary: '#D0BCFF',
              secondary: '#CCC2DC',
              tertiary: '#EFB8C8',
              error: '#F2B8B5',
              info: '#C5C6C9',
              success: '#A8DAB5',
              warning: '#FED7AA',
              background: '#1C1B1F',
              surface: '#1C1B1F',
            },
          },
        },
      },
    },
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
    '/': { swr: 300 },
    '/chase': { ssr: false },
    '/admin/**': { ssr: false },
    '/article/create': { ssr: false },
    '/article/*/edit': { ssr: false },
    '/user/**': { ssr: false },
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/setup': { ssr: false },
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
