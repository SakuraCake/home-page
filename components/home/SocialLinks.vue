<template>
  <v-row
    justify="center"
    class="ga-2"
  >
    <v-col
      v-for="link in socialLinks"
      :key="link.name"
      cols="auto"
    >
      <v-btn
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        variant="tonal"
        size="large"
        class="text-none"
      >
        <template #prepend>
          <BilibiliIcon
            v-if="link.name === 'Bilibili'"
            :size="24"
          />
          <SteamIcon
            v-else-if="link.name === 'Steam'"
            :size="24"
          />
          <v-icon
            v-else
            :icon="link.icon"
          />
        </template>
        {{ link.name }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { BilibiliIcon, SteamIcon } from 'vue3-simple-icons'
import type { SocialLink } from '~/config/app.config'

defineProps<{
  socialLinks: SocialLink[]
}>()
</script>
