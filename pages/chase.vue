<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-end">
          <ChaseAnimeFilter v-model="animeStore.filterType" @update:model-value="handleFilterChange" />
        </div>
      </v-col>
    </v-row>

    <v-row v-if="animeStore.error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal">
          {{ animeStore.error }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-if="animeStore.loading && animeStore.collections.length === 0">
      <v-col v-for="i in 12" :key="i" cols="6" sm="4" md="3" lg="2">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <v-row v-else-if="animeStore.collections.length === 0">
      <v-col cols="12">
        <v-empty-state icon="mdi-animation-outline" title="暂无番剧" text="还没有收藏任何番剧" />
      </v-col>
    </v-row>

    <template v-else>
      <v-row>
        <v-col v-for="collection in animeStore.collections" :key="collection.subject_id" cols="6" sm="4" md="3" lg="2">
          <ChaseAnimeCard :collection="collection" />
        </v-col>
      </v-row>

      <v-row v-if="animeStore.hasMore || animeStore.loading" class="mt-4">
        <v-col cols="12" class="text-center">
          <v-btn :loading="animeStore.loading" :disabled="animeStore.loading" color="primary" variant="tonal"
            @click="loadMore">
            <v-icon start>
              mdi-chevron-down
            </v-icon>
            加载更多
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { appConfig } from '~/config/app.config'
import type { CollectionType } from '~/composables/useBangumi'

definePageMeta({
  ssr: false
})

const animeStore = useAnimeStore()
const username = appConfig.bangumi.username

const handleFilterChange = async (type: CollectionType) => {
  animeStore.setFilterType(type)
  await animeStore.fetchCollections(username)
}

const loadMore = async () => {
  await animeStore.loadMore(username)
}

onMounted(async () => {
  if (animeStore.collections.length === 0) {
    await animeStore.fetchCollections(username)
  }
})

useHead({
  title: '追番列表'
})
</script>
