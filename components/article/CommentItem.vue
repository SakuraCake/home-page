<template>
  <div class="comment-item mb-4">
    <div class="d-flex align-start">
      <v-avatar size="40" class="mr-3">
        <v-icon v-if="!comment.user.avatar">mdi-account</v-icon>
        <v-img v-else :src="comment.user.avatar" />
      </v-avatar>
      <div class="flex-grow-1">
        <div class="d-flex align-center mb-1">
          <span class="font-weight-medium">{{ comment.user.username }}</span>
          <span class="text-caption text-medium-emphasis ml-2">
            {{ formatDate(comment.createdAt) }}
          </span>
        </div>
        <div class="text-body-2 mb-2">{{ comment.content }}</div>
        <div class="d-flex gap-2">
          <v-btn
            v-if="userStore.isLoggedIn"
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
  user: {
    id: number
    username: string
    avatar: string | null
  }
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

const canDelete = computed(() => {
  if (!userStore.isLoggedIn) return false
  return userStore.isAdmin || userStore.user?.id === props.comment.user.id
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
    // ignore
  }
}
</script>
