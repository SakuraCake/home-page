<template>
  <div class="comment-item mb-4">
    <div class="d-flex align-start">
      <v-avatar size="40" class="mr-3">
        <v-icon v-if="!displayAvatar">mdi-account</v-icon>
        <v-img v-else :src="displayAvatar" cover>
          <template #placeholder>
            <v-skeleton-loader type="image" />
          </template>
          <template #error>
            <v-icon>mdi-account</v-icon>
          </template>
        </v-img>
      </v-avatar>
      <div class="flex-grow-1">
        <div class="d-flex align-center mb-1">
          <span class="font-weight-medium">{{ displayName }}</span>
          <span class="text-caption text-medium-emphasis ml-2">
            {{ formatDate(comment.createdAt) }}
          </span>
        </div>
        <div class="text-body-2 mb-2">{{ comment.content }}</div>
        <div class="d-flex gap-2">
          <v-btn
            size="x-small"
            variant="text"
            @click="$emit('reply', comment.id)"
          >
            回复
          </v-btn>
          <v-btn
            v-if="canDelete"
            size="x-small"
            variant="text"
            color="error"
            @click="handleDelete"
          >
            删除
          </v-btn>
        </div>
      </div>
    </div>

    <div v-if="comment.replies?.length" class="ml-13 mt-3">
      <ArticleCommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :article-id="articleId"
        @reply="$emit('reply', $event)"
        @deleted="$emit('deleted')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Comment {
  id: number
  content: string
  createdAt: number
  deletedAt: number | null
  guestName?: string | null
  guestEmail?: string | null
  user?: {
    id: number
    username: string
    avatar: string | null
  } | null
  replies?: Comment[]
}

const props = defineProps<{
  comment: Comment
  articleId: number
}>()

const emit = defineEmits<{
  reply: [commentId: number]
  deleted: []
}>()

const userStore = useUserStore()

const displayName = computed(() => {
  if (props.comment.user) {
    return props.comment.user.username
  }
  return props.comment.guestName || '匿名用户'
})

const displayAvatar = computed(() => {
  if (props.comment.user?.avatar) {
    return props.comment.user.avatar
  }
  return null
})

const canDelete = computed(() => {
  if (!userStore.isLoggedIn) return false
  if (userStore.isAdmin) return true
  if (props.comment.user && userStore.user?.id === props.comment.user.id) return true
  return false
})

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDelete = async () => {
  if (!confirm('确定要删除这条评论吗？')) return

  try {
    const response = await $fetch(`/api/comments/${props.comment.id}`, {
      method: 'DELETE',
      headers: userStore.getAuthHeaders()
    })

    if (response.success) {
      emit('deleted')
    }
  } catch (e) {
  }
}
</script>
