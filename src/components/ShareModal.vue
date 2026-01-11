<template>
  <HIGModal
    :is-open="isOpen"
    title="Share Article"
    size="md"
    @close="close"
    @update:is-open="handleUpdate"
  >
    <div class="space-y-6">
      <!-- Social Media Buttons -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <!-- LinkedIn -->
        <button
          class="flex flex-col items-center justify-center p-4 rounded-lg border border-border-primary hover:border-primary-500 hover:bg-bg-tertiary transition-all group"
          title="Share on LinkedIn"
          @click="shareToLinkedIn"
        >
          <div class="w-12 h-12 rounded-full bg-[#0077b5] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Icon
              name="linkedin"
              :size="24"
              class="text-white"
            />
          </div>
          <span class="text-sm font-medium text-text-primary">LinkedIn</span>
        </button>

        <!-- Twitter/X -->
        <button
          class="flex flex-col items-center justify-center p-4 rounded-lg border border-border-primary hover:border-primary-500 hover:bg-bg-tertiary transition-all group"
          title="Share on Twitter/X"
          @click="shareToTwitter"
        >
          <div class="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Icon
              name="twitter"
              :size="24"
              class="text-white"
            />
          </div>
          <span class="text-sm font-medium text-text-primary">Twitter</span>
        </button>

        <!-- Facebook -->
        <button
          class="flex flex-col items-center justify-center p-4 rounded-lg border border-border-primary hover:border-primary-500 hover:bg-bg-tertiary transition-all group"
          title="Share on Facebook"
          @click="shareToFacebook"
        >
          <div class="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Icon
              name="facebook"
              :size="24"
              class="text-white"
            />
          </div>
          <span class="text-sm font-medium text-text-primary">Facebook</span>
        </button>

        <!-- Reddit -->
        <button
          class="flex flex-col items-center justify-center p-4 rounded-lg border border-border-primary hover:border-primary-500 hover:bg-bg-tertiary transition-all group"
          title="Share on Reddit"
          @click="shareToReddit"
        >
          <div class="w-12 h-12 rounded-full bg-[#FF4500] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Icon
              name="reddit"
              :size="24"
              class="text-white"
            />
          </div>
          <span class="text-sm font-medium text-text-primary">Reddit</span>
        </button>

        <!-- Email -->
        <button
          class="flex flex-col items-center justify-center p-4 rounded-lg border border-border-primary hover:border-primary-500 hover:bg-bg-tertiary transition-all group"
          title="Share via Email"
          @click="shareViaEmail"
        >
          <div class="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Icon
              name="mail"
              :size="24"
              class="text-white"
            />
          </div>
          <span class="text-sm font-medium text-text-primary">Email</span>
        </button>

        <!-- Copy Link -->
        <button
          class="flex flex-col items-center justify-center p-4 rounded-lg border border-border-primary hover:border-primary-500 hover:bg-bg-tertiary transition-all group"
          title="Copy Link"
          @click="copyLink"
        >
          <div class="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Icon
              name="copy"
              :size="24"
              class="text-text-primary"
            />
          </div>
          <span class="text-sm font-medium text-text-primary">Copy Link</span>
        </button>
      </div>

      <!-- Link Display -->
      <div class="pt-4 border-t border-border-primary">
        <label class="block text-sm font-medium text-text-primary mb-2">Article URL</label>
        <div class="flex items-center gap-2">
          <input
            :value="url"
            readonly
            class="flex-1 px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
          <button
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium"
            title="Copy URL"
            @click="copyLink"
          >
            <Icon
              name="copy"
              :size="16"
            />
          </button>
        </div>
      </div>
    </div>
  </HIGModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HIGModal from './hig/HIGModal.vue'
import Icon from './Icon.vue'

interface Props {
  isOpen: boolean
  title: string
  url: string
  description?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'update:isOpen': [value: boolean]
  'copied': []
}>()

const handleUpdate = (value: boolean) => {
  emit('update:isOpen', value)
}

const close = () => {
  emit('close')
  emit('update:isOpen', false)
}

const encodedUrl = computed(() => encodeURIComponent(props.url))
const encodedTitle = computed(() => encodeURIComponent(props.title))
const encodedDescription = computed(() => encodeURIComponent(props.description || props.title))

const shareToLinkedIn = () => {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`
  window.open(linkedInUrl, '_blank', 'width=600,height=400')
  close()
}

const shareToTwitter = () => {
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl.value}&text=${encodedTitle.value}`
  window.open(twitterUrl, '_blank', 'width=600,height=400')
  close()
}

const shareToFacebook = () => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`
  window.open(facebookUrl, '_blank', 'width=600,height=400')
  close()
}

const shareToReddit = () => {
  const redditUrl = `https://reddit.com/submit?url=${encodedUrl.value}&title=${encodedTitle.value}`
  window.open(redditUrl, '_blank', 'width=600,height=400')
  close()
}

const shareViaEmail = () => {
  const subject = encodeURIComponent(`Check out: ${props.title}`)
  const body = encodeURIComponent(`${props.description || props.title}\n\n${props.url}`)
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`
  window.location.href = mailtoUrl
  close()
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.url)
    emit('copied')
    close()
  } catch (err) {
    console.error('Failed to copy link:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.url
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      emit('copied')
      close()
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr)
    }
    document.body.removeChild(textArea)
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>

