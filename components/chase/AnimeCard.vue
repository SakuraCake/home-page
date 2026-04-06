<template>
  <v-card class="anime-card" hover @click="showDialog = true">
    <div class="anime-image-container">
      <v-img :src="collection.subject.images.large" :alt="collection.subject.name" cover class="h-100">
        <template #placeholder>
          <v-skeleton-loader type="image" height="100%" />
        </template>
      </v-img>
    </div>

    <v-card-title class="text-subtitle-1 text-truncate pa-2">
      {{ collection.subject.name_cn || collection.subject.name }}
    </v-card-title>

    <v-card-text class="pa-2 pt-0">
      <div class="text-caption text-truncate text-medium-emphasis mb-2">
        {{ collection.subject.name }}
      </div>

      <div class="d-flex align-center justify-space-between">
        <v-chip :color="getStatusColor(collection.type)" size="x-small" label>
          {{ getStatusLabel(collection.type) }}
        </v-chip>

        <span class="text-caption text-medium-emphasis">
          {{ progressText }}
        </span>
      </div>

      <v-progress-linear :model-value="progress" :color="totalEpisodes > 0 ? 'primary' : 'surface-variant'" height="4"
        class="mt-2" rounded />
    </v-card-text>
  </v-card>

  <ClientOnly>
    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-img :src="collection.subject.images.large" :alt="collection.subject.name" max-height="300" cover />

        <v-card-title class="text-h5">
          {{ collection.subject.name_cn || collection.subject.name }}
        </v-card-title>

        <v-card-subtitle v-if="collection.subject.name_cn">
          {{ collection.subject.name }}
        </v-card-subtitle>

        <v-card-text>
          <div class="d-flex align-center mb-3">
            <v-chip :color="getStatusColor(collection.type)" size="small" label class="mr-2">
              {{ getStatusLabel(collection.type) }}
            </v-chip>

            <span v-if="collection.rate > 0" class="text-body-2">
              <v-icon size="small" color="amber">mdi-star</v-icon>
              {{ collection.rate }} 分
            </span>
          </div>

          <div class="text-body-2 mb-2">
            <v-icon size="small" class="mr-1">
              mdi-television
            </v-icon>
            进度: {{ progressText }}
          </div>

          <div v-if="collection.subject.air_date" class="text-body-2 mb-2">
            <v-icon size="small" class="mr-1">
              mdi-calendar
            </v-icon>
            放送日期: {{ collection.subject.air_date }}
          </div>

          <div v-if="collection.subject.rating" class="text-body-2 mb-2">
            <v-icon size="small" class="mr-1">
              mdi-star-outline
            </v-icon>
            Bangumi评分: {{ collection.subject.rating.score }} ({{ collection.subject.rating.total }}人评分)
          </div>

          <v-progress-linear :model-value="progress" :color="totalEpisodes > 0 ? 'primary' : 'surface-variant'"
            height="6" class="mt-3" rounded />

          <div v-if="collection.comment" class="mt-3">
            <div class="text-subtitle-2 mb-1">
              我的评价
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ collection.comment }}
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text="关闭" variant="text" @click="showDialog = false" />
          <v-btn :href="`https://bgm.tv/subject/${collection.subject_id}`" target="_blank" color="primary"
            variant="flat">
            <v-icon start>
              mdi-open-in-new
            </v-icon>
            查看详情
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { BangumiCollection } from '~/composables/useBangumi'
import { COLLECTION_TYPE_LABELS } from '~/composables/useBangumi'

const props = defineProps<{
  collection: BangumiCollection
}>()

const showDialog = ref(false)

const totalEpisodes = computed(() => {
  return props.collection.subject.eps || props.collection.subject.eps_count || 0
})

const progress = computed(() => {
  if (totalEpisodes.value === 0) return 0
  return Math.round((props.collection.ep_status / totalEpisodes.value) * 100)
})

const progressText = computed(() => {
  if (totalEpisodes.value === 0) {
    return '未开播'
  }
  return `${props.collection.ep_status} / ${totalEpisodes.value} 集`
})

const getStatusLabel = (type: number): string => {
  return COLLECTION_TYPE_LABELS[type as keyof typeof COLLECTION_TYPE_LABELS] || '未知'
}

const getStatusColor = (type: number): string => {
  const colorMap: Record<number, string> = {
    1: 'info',
    2: 'success',
    3: 'primary',
    4: 'warning',
    5: 'error'
  }
  return colorMap[type] || 'default'
}
</script>

<style scoped>
.anime-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.anime-card:hover {
  transform: translateY(-4px);
}

.anime-image-container {
  height: 240px;
  overflow: hidden;
}

.anime-card :deep(.v-card-text) {
  flex-grow: 1;
}
</style>
