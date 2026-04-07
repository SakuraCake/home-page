<template>
  <v-container max-width="1200">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs
          :items="breadcrumbs"
          class="pa-0 mb-4"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 py-4 px-6 d-flex justify-space-between align-center">
            <span>评论管理</span>
            <v-chip-group
              v-model="statusFilter"
              mandatory
              @update:model-value="loadComments"
            >
              <v-chip
                value=""
                variant="outlined"
              >
                全部
              </v-chip>
              <v-chip
                value="pending"
                variant="outlined"
                color="warning"
              >
                待审核
              </v-chip>
              <v-chip
                value="approved"
                variant="outlined"
                color="success"
              >
                已通过
              </v-chip>
              <v-chip
                value="rejected"
                variant="outlined"
                color="error"
              >
                已拒绝
              </v-chip>
            </v-chip-group>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <div
              v-if="loading"
              class="text-center py-4"
            >
              <v-progress-circular indeterminate />
            </div>

            <v-empty-state
              v-else-if="comments.length === 0"
              icon="mdi-comment-off-outline"
              title="暂无评论"
              text="还没有任何评论"
            />

            <div v-else>
              <v-list lines="three">
                <v-list-item
                  v-for="comment in comments"
                  :key="comment.id"
                  class="px-0"
                >
                  <template #prepend>
                    <v-avatar size="40">
                      <v-img
                        v-if="comment.user?.avatar"
                        :src="comment.user.avatar"
                      />
                      <v-icon v-else>
                        mdi-account
                      </v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="d-flex align-center ga-2">
                    <span>{{ comment.user?.username || comment.guestName || '匿名用户' }}</span>
                    <v-chip
                      size="x-small"
                      :color="getStatusColor(comment.status)"
                    >
                      {{ getStatusText(comment.status) }}
                    </v-chip>
                  </v-list-item-title>

                  <v-list-item-subtitle class="mt-1">
                    <span class="text-medium-emphasis">
                      {{ formatDate(comment.createdAt) }} ·
                      <NuxtLink
                        :to="`/article/${comment.article?.id}`"
                        class="text-primary"
                      >
                        {{ comment.article?.title || '文章已删除' }}
                      </NuxtLink>
                    </span>
                  </v-list-item-subtitle>

                  <v-list-item-text class="mt-2">
                    {{ comment.content }}
                  </v-list-item-text>

                  <template #append>
                    <div class="d-flex flex-column ga-2">
                      <v-btn
                        v-if="comment.status !== 'approved'"
                        size="small"
                        color="success"
                        variant="outlined"
                        @click="updateStatus(comment.id, 'approved')"
                      >
                        通过
                      </v-btn>
                      <v-btn
                        v-if="comment.status !== 'rejected'"
                        size="small"
                        color="error"
                        variant="outlined"
                        @click="updateStatus(comment.id, 'rejected')"
                      >
                        拒绝
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>

              <v-pagination
                v-if="totalPages > 1"
                v-model="currentPage"
                :length="totalPages"
                class="mt-4"
                @update:model-value="loadComments"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { CommentWithArticle, ApiResponse, PaginatedResponse } from '~/types/api'

const userStore = useUserStore()
const router = useRouter()
const snackbar = useSnackbar()

const breadcrumbs = [
  { title: '首页', to: '/' },
  { title: '管理中心', to: '/admin' },
  { title: '评论管理', disabled: true }
]

const loading = ref(false)
const comments = ref<CommentWithArticle[]>([])
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 20
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    default: return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return '已通过'
    case 'pending': return '待审核'
    case 'rejected': return '已拒绝'
    default: return '未知'
  }
}

const loadComments = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      pageSize,
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    const response = await $fetch<ApiResponse<PaginatedResponse<CommentWithArticle>>>('/api/admin/comments', {
      query: params,
      headers: userStore.getAuthHeaders(),
    })

    if (response.success && response.data) {
      comments.value = response.data.list
      total.value = response.data.total
    }
  } catch (_e) {
  } finally {
    loading.value = false
  }
}

const updateStatus = async (commentId: number, status: string) => {
  try {
    const response = await $fetch<ApiResponse>(`/api/admin/comments/${commentId}/status`, {
      method: 'PUT',
      body: { status },
      headers: userStore.getAuthHeaders(),
    })

    if (response.success) {
      snackbar.success('状态更新成功')
      await loadComments()
    }
  } catch (_e) {
    snackbar.error('状态更新失败')
  }
}

useHead({
  title: '评论管理'
})

onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/')
    return
  }
  loadComments()
})
</script>
