<template>
  <div class="comment-item">
    <div class="flex items-start space-x-4">
      <!-- Avatar -->
      <div
        v-if="comment.user?.photo_url"
        class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
      >
        <img 
          :src="comment.user.photo_url" 
          :alt="getAuthorName()"
          class="w-full h-full object-cover"
        >
      </div>
      <div
        v-else
        class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0"
      >
        <span class="text-white font-medium text-sm">{{ getAuthorInitials() }}</span>
      </div>

      <!-- Comment Content -->
      <div class="flex-1">
        <div class="bg-bg-secondary rounded-lg p-4 border border-border-primary">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <span class="font-medium text-text-primary">{{ getAuthorName() }}</span>
              <span class="text-sm text-text-tertiary">{{ formatDate(comment.created_at) }}</span>
              <span
                v-if="comment.updated_at !== comment.created_at"
                class="text-xs text-text-tertiary"
              >
                (edited)
              </span>
            </div>
            <div
              v-if="canEditOrDelete"
              class="flex items-center space-x-2"
            >
              <button
                v-if="canEdit"
                class="text-xs text-text-tertiary hover:text-primary-500 transition-colors"
                @click="$emit('edit', comment)"
              >
                Edit
              </button>
              <button
                class="text-xs text-text-tertiary hover:text-danger transition-colors"
                @click="$emit('delete', comment.id)"
              >
                Delete
              </button>
            </div>
          </div>
          <p class="text-text-secondary whitespace-pre-wrap">
            {{ comment.content }}
          </p>
        </div>

        <!-- Reply Button -->
        <div class="mt-2 flex items-center space-x-4">
          <button
            class="text-sm text-text-tertiary hover:text-primary-500 transition-colors font-medium"
            @click="$emit('reply', comment)"
          >
            Reply
          </button>
          <span
            v-if="replies.length > 0"
            class="text-xs text-text-tertiary"
          >
            {{ replies.length }} {{ replies.length === 1 ? 'reply' : 'replies' }}
          </span>
        </div>

        <!-- Inline Reply Form (shown when this comment is being replied to) -->
        <div
          v-if="showReplyForm && currentUserId"
          class="mt-4 ml-0"
        >
          <div class="bg-bg-secondary rounded-lg p-4 border border-border-primary">
            <div class="flex items-start space-x-3 mb-3">
              <div class="flex-1">
                <p class="text-xs text-text-tertiary mb-2">
                  Replying to <span class="font-medium text-text-primary">{{ getAuthorName() }}</span>
                </p>
                <textarea
                  v-model="replyContent"
                  :placeholder="`Write a reply to ${getAuthorName()}...`"
                  rows="3"
                  class="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <div class="flex items-center justify-end space-x-2 mt-2">
                  <button
                    class="text-sm text-text-tertiary hover:text-text-primary transition-colors px-3 py-1"
                    @click="cancelReply"
                  >
                    Cancel
                  </button>
                  <button
                    class="text-sm bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!replyContent.trim()"
                    @click="submitReply"
                  >
                    Post Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else-if="showReplyForm && !currentUserId"
          class="mt-4 ml-0 p-3 bg-bg-secondary rounded-lg border border-border-primary"
        >
          <p class="text-sm text-text-secondary mb-2">
            Please sign in to reply to comments.
          </p>
        </div>

        <!-- Nested Replies Thread -->
        <div
          v-if="replies.length > 0"
          class="mt-4 space-y-4"
        >
          <div class="ml-6 pl-4 border-l-2 border-border-primary space-y-4">
            <CommentItem
              v-for="reply in replies"
              :key="reply.id"
              :comment="reply"
              :current-user-id="currentUserId"
              :all-comments="allComments"
              :replying-to-id="replyingToId"
              @reply="handleReply"
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  comment: any
  currentUserId?: string
  allComments: any[]
  replyingToId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  reply: [comment: any]
  edit: [comment: any]
  delete: [commentId: string]
  submitReply: [content: string, parentId: string]
}>()

const showReplyForm = ref(false)
const replyContent = ref('')

// Watch if this comment is being replied to
watch(() => props.replyingToId, (newId) => {
  showReplyForm.value = newId === props.comment.id
  if (showReplyForm.value) {
    replyContent.value = ''
  }
}, { immediate: true })

const handleReply = (comment: any) => {
  emit('reply', comment)
}

const submitReply = () => {
  if (!replyContent.value.trim()) return
  emit('submitReply', replyContent.value.trim(), props.comment.id)
  replyContent.value = ''
  showReplyForm.value = false
}

const cancelReply = () => {
  replyContent.value = ''
  showReplyForm.value = false
  emit('reply', null) // Clear the replying state
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const getAuthorName = () => {
  if (props.comment.user?.display_name) {
    return props.comment.user.display_name
  }
  if (props.comment.user?.email) {
    return props.comment.user.email.split('@')[0]
  }
  return 'Anonymous'
}

const getAuthorInitials = () => {
  const user = props.comment.user
  if (user?.display_name) {
    const parts = user.display_name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return user.display_name.substring(0, 2).toUpperCase()
  }
  if (user?.email) {
    return user.email.substring(0, 2).toUpperCase()
  }
  return 'AN'
}

const canEdit = computed(() => {
  return props.currentUserId && props.comment.user_id === props.currentUserId
})

const canDelete = computed(() => {
  return props.currentUserId && props.comment.user_id === props.currentUserId
})

const canEditOrDelete = computed(() => {
  return canEdit.value || canDelete.value
})

const replies = computed(() => {
  return props.allComments
    .filter(c => c.parent_id === props.comment.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
})
</script>

<style scoped>
.comment-item {
  @apply py-2;
}
</style>

