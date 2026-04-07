<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-avatar :image="displayAvatar" size="128" class="mb-6" />

        <h1 class="text-h4 text-md-h3 font-weight-bold mb-4">
          {{ displayTitle }}
        </h1>

        <p v-if="displaySubtitle" class="text-h6 text-medium-emphasis mb-4">
          {{ displaySubtitle }}
        </p>

        <p v-if="displayDescription" class="text-body-1 text-medium-emphasis mb-8">
          {{ displayDescription }}
        </p>

        <HomeSocialLinks :social-links="socialLinks" />

        <v-btn v-if="config?.homeShowArticles" color="primary" class="mt-6" to="/article">
          浏览文章
          <v-icon end>
            mdi-arrow-right
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="config?.homeShowArticles && recentArticles.length > 0" class="mt-12">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">
          最新文章
        </h2>
      </v-col>
      <v-col v-for="article in recentArticles" :key="article.id" cols="12" sm="6" md="4">
        <v-card :to="`/article/${article.id}`" height="100%">
          <v-img v-if="article.coverImage" :src="article.coverImage" height="150" cover />
          <v-card-title class="text-subtitle-1">
            {{ article.title }}
          </v-card-title>
          <v-card-subtitle>
            {{ formatDate(article.createdAt) }}
          </v-card-subtitle>
        </v-card>
      </v-col>
      <v-col v-if="hasMoreArticles" cols="12" class="text-center">
        <v-btn variant="text" to="/article">
          查看更多文章
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { SiteConfig, Article, ApiResponse } from '~/types/api'

const defaultAvatar = 'https://cdn.sorange.top/image/logo.png'

const { data: config } = await useAsyncData<SiteConfig | null>(
  'home-config',
  async () => {
    try {
      const response = await $fetch<ApiResponse<SiteConfig>>('/api/config/site')
      return response.success ? response.data ?? null : null
    } catch {
      return null
    }
  }
)

const { data: articlesData } = await useAsyncData<{ articles: Article[], total: number } | null>(
  'home-articles',
  async () => {
    try {
      const response = await $fetch<ApiResponse<{ articles: Article[], total: number }>>('/api/articles', {
        query: { page: 1, limit: 6 }
      })
      return response.success ? response.data ?? null : null
    } catch {
      return null
    }
  }
)

const recentArticles = computed(() => articlesData.value?.articles ?? [])
const hasMoreArticles = computed(() => (articlesData.value?.total ?? 0) > 6)

const displayTitle = computed(() => config.value?.homeTitle || '欢迎来到我的主页')
const displaySubtitle = computed(() => config.value?.homeSubtitle || '')
const displayDescription = computed(() => config.value?.homeDescription || '')
const displayAvatar = computed(() => config.value?.homeAvatar || defaultAvatar)
const socialLinks = computed(() => config.value?.socialLinks ?? [])

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

useHead({
  title: '首页',
  meta: [
    { name: 'description', content: () => displayDescription.value || displayTitle.value },
    { property: 'og:title', content: () => displayTitle.value },
    { property: 'og:description', content: () => displayDescription.value || '' },
    { property: 'og:image', content: () => displayAvatar.value },
  ]
})
</script>
