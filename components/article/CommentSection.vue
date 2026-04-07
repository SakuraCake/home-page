<template>
  <div>
    <v-alert
      v-if="!allowComment"
      type="info"
      class="mb-4"
    >
      评论功能已关闭
    </v-alert>

    <template v-else>
      <template v-if="!userStore.isLoggedIn">
        <v-row class="mb-4">
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="guestName"
              label="昵称 *"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || '请输入昵称']"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-text-field
              v-model="guestEmail"
              label="邮箱（可选）"
              variant="outlined"
              density="compact"
            />
          </v-col>
        </v-row>
      </template>

      <v-textarea
        v-model="newComment"
        label="发表评论"
        variant="outlined"
        rows="3"
        auto-grow
        class="mb-4"
      />

      <div
        v-if="!userStore.isLoggedIn && isVerified"
        class="mb-4 d-flex align-center ga-2 text-success text-body-2"
      >
        <v-icon size="small">
          mdi-check-circle
        </v-icon>
        验证通过
      </div>

      <v-btn
        color="primary"
        :loading="submitting || isLoading"
        :disabled="!canSubmitWithoutCaptcha"
        @click="handleSubmit"
      >
        发表
      </v-btn>

      <v-divider class="my-6" />

      <div
        v-if="loading"
        class="text-center py-4"
      >
        <v-progress-circular indeterminate />
      </div>

      <v-empty-state
        v-else-if="comments.length === 0"
        icon="mdi-comment-outline"
        title="暂无评论"
        text="快来发表第一条评论吧！"
      />

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
    </template>
  </div>
</template>

<script setup lang="ts">
import type { CommentWithReplies, ApiResponse } from '~/types/api'

const props = defineProps<{
  articleId: number
}>()

const userStore = useUserStore()
const snackbar = useSnackbar()
const { isReady, isVerified, validateResult, isLoading, init, verify, reset } = useGeetest()
const { fetchConfig, allowComment, captchaCommentEnabled } = useSiteConfig()

const comments = ref<CommentWithReplies[]>([])
const loading = ref(true)
const submitting = ref(false)
const newComment = ref('')
const replyTo = ref<number | null>(null)
const guestName = ref('')
const guestEmail = ref('')
const needCaptcha = ref(true)

const canSubmitWithoutCaptcha = computed(() => {
  if (!newComment.value.trim()) return false

  if (userStore.isLoggedIn) return true

  if (!guestName.value.trim()) return false

  return true
})

const loadComments = async () => {
  loading.value = true
  try {
    const response = await $fetch<ApiResponse<CommentWithReplies[]>>(`/api/articles/${props.articleId}/comments`)
    if (response.success && response.data) {
      comments.value = response.data
    }
  } catch (_e) {
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return

  submitting.value = true
  try {
    const body: Record<string, unknown> = {
      content: newComment.value,
      parentId: replyTo.value
    }

    if (!userStore.isLoggedIn) {
      body.guestName = guestName.value
      body.guestEmail = guestEmail.value || undefined

      if (needCaptcha.value && validateResult.value) {
        body.geetest_challenge = validateResult.value.geetest_challenge
        body.geetest_validate = validateResult.value.geetest_validate
        body.geetest_seccode = validateResult.value.geetest_seccode
      }
    }

    const options: Record<string, unknown> = {
      method: 'POST',
      body
    }

    if (userStore.isLoggedIn) {
      options.headers = userStore.getAuthHeaders()
    }

    const response = await $fetch<ApiResponse>(`/api/articles/${props.articleId}/comments`, options)

    if (response.success) {
      snackbar.success('评论发表成功')
      newComment.value = ''
      replyTo.value = null
      if (!userStore.isLoggedIn) {
        reset()
      }
      await loadComments()
    }
  } catch (_e) {
    snackbar.error('评论发表失败')
  } finally {
    submitting.value = false
  }
}

const handleSubmit = async () => {
  if (userStore.isLoggedIn || isVerified.value || !needCaptcha.value) {
    await submitComment()
    return
  }

  if (!isReady.value) {
    await init()
  }
  verify()
}

const handleReply = (commentId: number) => {
  replyTo.value = commentId
}

watch(isVerified, async (verified) => {
  if (verified) {
    await submitComment()
  }
})

onMounted(async () => {
  await loadComments()

  if (!userStore.isLoggedIn) {
    await fetchConfig()
    needCaptcha.value = captchaCommentEnabled.value
    if (needCaptcha.value && allowComment.value) {
      init()
    }
  }
})

watch(() => userStore.isLoggedIn, async (isLoggedIn) => {
  if (!isLoggedIn) {
    await fetchConfig()
    needCaptcha.value = captchaCommentEnabled.value
    if (needCaptcha.value && allowComment.value) {
      init()
    }
  }
})
</script>
