<template>
  <v-container class="fill-height">
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="6"
        class="text-center"
      >
        <v-avatar
          :image="avatarUrl"
          size="128"
          class="mb-6"
        />

        <h1 class="text-h4 text-md-h3 font-weight-bold mb-4">
          欢迎来到我的主页
        </h1>

        <p class="text-body-1 text-medium-emphasis mb-8">
          我是一个初中生
        </p>

        <HomeSocialLinks :social-links="appConfig.socialLinks" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { appConfig } from '~/config/app.config'

const avatarUrl = 'https://cdn.sorange.top/image/logo.png'

useHead({
  title: '首页'
})
</script>
