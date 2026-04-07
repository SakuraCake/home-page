<template>
  <v-container max-width="900">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">
          文章
        </h1>
      </v-col>
    </v-row>

    <v-row v-if="articleStore.loading">
      <v-col
        v-for="i in 4"
        :key="i"
        cols="12"
        md="6"
      >
        <v-card height="100%">
          <v-skeleton-loader
            type="image"
            height="200"
          />
          <v-card-title>
            <v-skeleton-loader
              type="text"
              width="80%"
            />
          </v-card-title>
          <v-card-subtitle>
            <v-skeleton-loader
              type="text"
              width="100%"
            />
          </v-card-subtitle>
          <v-card-text>
            <v-skeleton-loader type="text@2" />
          </v-card-text>
          <v-card-actions>
            <v-skeleton-loader type="chip@2" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else-if="articleStore.articles.length === 0">
      <v-col cols="12">
        <v-empty-state
          icon="mdi-file-document-outline"
          title="暂无文章"
          text="还没有发布任何文章"
        />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="article in articleStore.articles"
        :key="article.id"
        cols="12"
        md="6"
      >
        <v-card
          :to="`/article/${article.id}`"
          height="100%"
        >
          <v-img
            v-if="article.coverImage"
            :src="article.coverImage"
            height="200"
            cover
          />
          <v-card-title class="text-h6">
            {{ article.title }}
          </v-card-title>
          <v-card-subtitle>
            <v-chip
              size="x-small"
              label
              class="mr-1"
            >
              <v-icon start>
                mdi-account
              </v-icon>
              {{ article.author?.username || '未知' }}
            </v-chip>
            <v-chip
              size="x-small"
              label
              class="mr-1"
            >
              <v-icon start>
                mdi-calendar
              </v-icon>
              {{ formatDate(article.createdAt) }}
            </v-chip>
            <v-chip
              size="x-small"
              label
            >
              <v-icon start>
                mdi-eye
              </v-icon>
              {{ article.viewCount }}
            </v-chip>
          </v-card-subtitle>
          <v-card-text>
            {{ article.summary || '暂无摘要' }}
          </v-card-text>
          <v-card-actions v-if="article.tags?.length">
            <v-chip
              v-for="tag in article.tags"
              :key="tag.id"
              size="x-small"
              class="mr-1"
            >
              {{ tag.name }}
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col
        v-if="articleStore.hasMore"
        cols="12"
        class="text-center"
      >
        <v-btn
          variant="tonal"
          :loading="articleStore.loading"
          @click="loadMore"
        >
          加载更多
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const articleStore = useArticleStore()

useHead({
  title: '文章'
})

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const loadMore = async () => {
  await articleStore.fetchArticles({
    page: articleStore.page + 1
  })
}

onMounted(async () => {
  await articleStore.fetchArticles()
})
</script>
