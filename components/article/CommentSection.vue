<template>
  <div>
    <div v-if="!userStore.isLoggedIn" class="text-center py-4">
      <v-btn variant="outlined" to="/login">
        登录后参与评论
      </v-btn>
    </div>

    <template v-else>
      <v-textarea
        v-model="newComment"
        label="发表评论"
        variant="outlined"
        rows="3"
        auto-grow
        class="mb-4"
      />
      <v-btn
        color="primary"
        :loading="submitting"
        :disabled="!newComment.trim()"
        @click="submitComment"
      >
        发表
      </v-btn>
    </template>

    <v-divider class="my-6" />

    <div v-if="loading" class="text-center py-4">
      <v-progress-circular indeterminate />
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-4 text-medium-emphasis">
      暂无评论，快来发表第一条评论吧！
    </div>

    <div v-else>
      <ArticleCommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :article-id="articleId"
        @reply="handleReply"
        @deleted="loadComments"
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
  articleId: number
}>()

const userStore = useUserStore()

const comments = ref<Comment[]>([])
const loading = ref(true)
const submitting = ref(false)
const newComment = ref('')
const replyTo = ref<number | null>(null)

const loadComments = async () => {
  loading.value = true
  try {
    const response = await $fetch(`/api/articles/${props.articleId}/comments`)
    if (response.success && response.data) {
      comments.value = response.data
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return

  submitting.value = true
  try {
    const response = await $fetch(`/api/articles/${props.articleId}/comments`, {
      method: 'POST',
      body: {
        content: newComment.value,
        parentId: replyTo.value
      },
      headers: userStore.getAuthHeaders()
    })

    if (response.success) {
      newComment.value = ''
      replyTo.value = null
      await loadComments()
    }
  } catch (e) {
    // ignore
  } finally {
    submitting.value = false
  }
}

const handleReply = (commentId: number) => {
  replyTo.value = commentId
}

onMounted(() => {
  loadComments()
})
</script>
