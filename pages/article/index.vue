<template>
  <v-container max-width="900">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-16">
            <v-icon size="80" color="primary" class="mb-4">mdi-file-document-multiple-outline</v-icon>
            <h2 class="text-h4 mb-2">文章列表</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              该功能正在开发中，敬请期待...
            </p>
            <v-btn color="primary" variant="tonal" disabled>
              <v-icon start>mdi-plus</v-icon>
              暂无文章
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
useHead({
  title: '文章'
})
</script>
