<template>
  <v-container max-width="900">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 py-4 px-6">
            文章标题占位符
          </v-card-title>
          <v-card-subtitle class="px-6">
            <v-chip size="small" label class="mr-2">
              <v-icon start>mdi-calendar</v-icon>
              2024-01-01
            </v-chip>
            <v-chip size="small" label>
              <v-icon start>mdi-clock-outline</v-icon>
              预计阅读 5 分钟
            </v-chip>
          </v-card-subtitle>
          <v-divider class="my-4" />
          <v-card-text class="px-6 py-8">
            <div class="text-body-1 text-medium-emphasis text-center py-12">
              <v-icon size="64" color="primary" class="mb-4">mdi-file-document-outline</v-icon>
              <p class="text-h6 mb-2">文章内容占位符</p>
              <p>文章 ID: {{ id }}</p>
              <p class="text-caption mt-4">该功能正在开发中，敬请期待...</p>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-6">
            <v-btn variant="text" to="/article">
              <v-icon start>mdi-arrow-left</v-icon>
              返回列表
            </v-btn>
            <v-spacer />
            <v-btn variant="text" disabled>
              <v-icon start>mdi-share-variant</v-icon>
              分享
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id)

useHead({
  title: '文章详情'
})
</script>
