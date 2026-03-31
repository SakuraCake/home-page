<template>
  <div class="anime-filter">
    <v-select
      v-model="selectedType"
      :items="filterOptions"
      item-title="label"
      item-value="value"
      label="状态筛选"
      variant="outlined"
      density="comfortable"
      hide-details
      style="max-width: 200px"
      @update:model-value="handleFilterChange"
    >
      <template #prepend-inner>
        <v-icon>mdi-filter-variant</v-icon>
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts">
import type { CollectionType } from '~/composables/useBangumi'
import { COLLECTION_TYPE_LABELS } from '~/composables/useBangumi'

const props = defineProps<{
  modelValue: CollectionType
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CollectionType]
}>()

const selectedType = ref<CollectionType>(props.modelValue)

const filterOptions = computed(() => {
  return Object.entries(COLLECTION_TYPE_LABELS).map(([value, label]) => ({
    value: Number(value) as CollectionType,
    label
  }))
})

const handleFilterChange = (value: CollectionType) => {
  emit('update:modelValue', value)
}

watch(() => props.modelValue, (newVal) => {
  selectedType.value = newVal
})
</script>

<style scoped>
.anime-filter {
  display: flex;
  align-items: center;
}
</style>
